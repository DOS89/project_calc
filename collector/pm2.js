module.exports = {
    apps : [
        {
            exec_mode: "cluster",
            cwd: "/home/manager/collector/",
            max_memory_restart: "300M",
            restart_delay: "10000",
            listen_timeout: "60000",
            name: "autoru-a",
            script: "./src/autoru-a.js"
        },
        {
            exec_mode: "cluster",
            cwd: "/home/manager/collector/",
            max_memory_restart: "300M",
            restart_delay: "10000",
            listen_timeout: "60000",
            name: "autoru-b",
            script: "./src/autoru-b.js"
        },
        {
            exec_mode: "cluster",
            cwd: "/home/manager/collector/",
            max_memory_restart: "300M",
            restart_delay: "10000",
            listen_timeout: "60000",
            name: "autoru-c",
            script: "./src/autoru-c.js"
        },
        {
            exec_mode: "cluster",
            cwd: "/home/manager/collector/",
            max_memory_restart: "300M",
            restart_delay: "10000",
            listen_timeout: "60000",
            name: "autoru-d",
            script: "./src/autoru-d.js"
        },
        {
            exec_mode: "cluster",
            cwd: "/home/manager/collector/",
            max_memory_restart: "300M",
            restart_delay: "10000",
            listen_timeout: "60000",
            name: "autoru-e",
            script: "./src/autoru-e.js"
        },
    ]
};
