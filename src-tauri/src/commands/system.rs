use tauri_plugin_dialog::DialogExt;
use sysinfo::{System, Disks, Networks};

#[tauri::command]
pub fn get_system_info() -> Result<serde_json::Value, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    let cpu_usage = sys.global_cpu_usage();
    let cpu_count = sys.cpus().len();
    let cpu_name = sys.cpus().first()
        .map(|c| c.brand().to_string())
        .unwrap_or_else(|| "Unknown".to_string());
    
    let total_memory = sys.total_memory();
    let used_memory = sys.used_memory();
    let available_memory = sys.available_memory();
    let memory_usage = if total_memory > 0 {
        (used_memory as f64 / total_memory as f64 * 100.0) as f32
    } else {
        0.0
    };
    
    let total_swap = sys.total_swap();
    let used_swap = sys.used_swap();
    let swap_usage = if total_swap > 0 {
        (used_swap as f64 / total_swap as f64 * 100.0) as f32
    } else {
        0.0
    };
    
    let disks = Disks::new_with_refreshed_list();
    
    let real_disks: Vec<_> = disks.iter().filter(|disk| {
        let fs = disk.file_system().to_string_lossy().to_lowercase();
        let mount = disk.mount_point().to_string_lossy().to_string();
        
        let virtual_fs = ["tmpfs", "devtmpfs", "sysfs", "proc", "devpts",
                          "securityfs", "cgroup", "cgroup2", "pstore", "debugfs",
                          "hugetlbfs", "mqueue", "configfs", "fusectl", "fuse.portal",
                          "binfmt_misc", "autofs", "efivarfs", "tracefs",
                          "ramfs", "overlay", "squashfs", "nsfs", "fuse.snapfuse"];
        if virtual_fs.iter().any(|v| fs == *v) {
            return false;
        }
        
        if mount.starts_with("/snap/") || mount.starts_with("/snap") {
            return false;
        }

        if mount.starts_with("/sys") || mount.starts_with("/proc") || mount == "/dev" {
            return false;
        }
        if mount.starts_with("/run") && !mount.starts_with("/run/media") {
            return false;
        }
        
        if mount.starts_with("/var/lib/docker") {
            return false;
        }
        
        if disk.total_space() == 0 {
            return false;
        }
        
        true
    }).collect();
    let mut seen_totals = std::collections::HashSet::new();
    let mut deduped_disks: Vec<_> = Vec::new();
    
    for disk in &real_disks {
        let fs = disk.file_system().to_string_lossy().to_lowercase();
        let total = disk.total_space();
        
        if fs == "apfs" {
            if seen_totals.contains(&total) {
                continue;
            }
            seen_totals.insert(total);
        }
        
        deduped_disks.push(*disk);
    }
    
    let disk_info: Vec<serde_json::Value> = real_disks.iter().map(|disk| {
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total.saturating_sub(available);
        let usage = if total > 0 {
            (used as f64 / total as f64 * 100.0) as f32
        } else {
            0.0
        };
        serde_json::json!({
            "name": disk.name().to_string_lossy(),
            "mount_point": disk.mount_point().to_string_lossy(),
            "file_system": disk.file_system().to_string_lossy().to_string(),
            "total": total,
            "used": used,
            "available": available,
            "usage": usage,
            "is_removable": disk.is_removable(),
        })
    }).collect();
    
    let total_disk_space: u64 = deduped_disks.iter().map(|d| d.total_space()).sum();
    let total_disk_available: u64 = deduped_disks.iter().map(|d| d.available_space()).sum();
    let total_disk_used = total_disk_space.saturating_sub(total_disk_available);
    let total_disk_usage = if total_disk_space > 0 {
        (total_disk_used as f64 / total_disk_space as f64 * 100.0) as f32
    } else {
        0.0
    };

    let networks = Networks::new_with_refreshed_list();
    let network_info: Vec<serde_json::Value> = networks.iter().map(|(name, data)| {
        serde_json::json!({
            "name": name,
            "received": data.total_received(),
            "transmitted": data.total_transmitted(),
        })
    }).collect();
    
    let total_received: u64 = networks.iter().map(|(_, d)| d.total_received()).sum();
    let total_transmitted: u64 = networks.iter().map(|(_, d)| d.total_transmitted()).sum();
    
    let uptime = System::uptime();
    
    let os_name = System::name().unwrap_or_else(|| "Unknown".to_string());
    let os_version = System::os_version().unwrap_or_else(|| "Unknown".to_string());
    let kernel_version = System::kernel_version().unwrap_or_else(|| "Unknown".to_string());
    let host_name = System::host_name().unwrap_or_else(|| "Unknown".to_string());
    
    let process_count = sys.processes().len();
    
    Ok(serde_json::json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "os_name": os_name,
        "os_version": os_version,
        "kernel_version": kernel_version,
        "host_name": host_name,
        "cpu": {
            "name": cpu_name,
            "count": cpu_count,
            "usage": cpu_usage,
        },
        "memory": {
            "total": total_memory,
            "used": used_memory,
            "available": available_memory,
            "usage": memory_usage,
        },
        "swap": {
            "total": total_swap,
            "used": used_swap,
            "usage": swap_usage,
        },
        "disk": {
            "total": total_disk_space,
            "used": total_disk_used,
            "available": total_disk_available,
            "usage": total_disk_usage,
            "disks": disk_info,
        },
        "network": {
            "total_received": total_received,
            "total_transmitted": total_transmitted,
            "interfaces": network_info,
        },
        "uptime": uptime,
        "process_count": process_count,
    }))
}

#[tauri::command]
pub async fn pick_jar_file(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let (tx, rx) = std::sync::mpsc::channel();

    app.dialog()
        .file()
        .set_title("Select server JAR file")
        .add_filter("JAR Files", &["jar"])
        .add_filter("All Files", &["*"])
        .pick_file(move |path| {
            let result = path.map(|p| p.to_string());
            let _ = tx.send(result);
        });

    rx.recv()
        .map_err(|e| format!("Dialog error: {}", e))
}

#[tauri::command]
pub async fn pick_java_file(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let (tx, rx) = std::sync::mpsc::channel();

    app.dialog()
        .file()
        .set_title("Select Java executable")
        .add_filter("Executable", &["exe", ""])
        .add_filter("All Files", &["*"])
        .pick_file(move |path| {
            let result = path.map(|p| p.to_string());
            let _ = tx.send(result);
        });

    rx.recv()
        .map_err(|e| format!("Dialog error: {}", e))
}

#[tauri::command]
pub async fn pick_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let (tx, rx) = std::sync::mpsc::channel();

    app.dialog()
        .file()
        .set_title("Select modpack folder")
        .pick_folder(move |path| {
            let result = path.map(|p| p.to_string());
            let _ = tx.send(result);
        });

    rx.recv()
        .map_err(|e| format!("Dialog error: {}", e))
}

#[tauri::command]
pub async fn pick_image_file(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let (tx, rx) = std::sync::mpsc::channel();

    app.dialog()
        .file()
        .set_title("Select background image")
        .add_filter("Image Files", &["png", "jpg", "jpeg", "webp", "gif", "bmp"])
        .add_filter("All Files", &["*"])
        .pick_file(move |path| {
            let result = path.map(|p| p.to_string());
            let _ = tx.send(result);
        });

    rx.recv()
        .map_err(|e| format!("Dialog error: {}", e))
}
