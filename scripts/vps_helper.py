#!/usr/bin/env python3
import os
import sys
import pty
import select
import time

VPS_HOST = "root@p2.hcraft.online"
VPS_PASS = b"ro8765\n"

def run_ssh(cmd, timeout=300):
    pid, fd = pty.fork()
    if pid == 0:
        os.execlp("ssh", "ssh", "-o", "StrictHostKeyChecking=no", VPS_HOST, cmd)
    else:
        output = b""
        sent_pass = False
        start = time.time()
        while time.time() - start < timeout:
            r, _, _ = select.select([fd], [], [], 0.5)
            if fd in r:
                try:
                    data = os.read(fd, 2048)
                    if not data:
                        break
                    output += data
                    if b"password:" in output.lower() and not sent_pass:
                        os.write(fd, VPS_PASS)
                        sent_pass = True
                except OSError:
                    break
        os.waitpid(pid, 0)
        return output.decode("utf-8", errors="replace")

def run_scp(local_path, remote_path, timeout=600):
    pid, fd = pty.fork()
    if pid == 0:
        os.execlp("scp", "scp", "-o", "StrictHostKeyChecking=no", "-r", local_path, f"{VPS_HOST}:{remote_path}")
    else:
        output = b""
        sent_pass = False
        start = time.time()
        while time.time() - start < timeout:
            r, _, _ = select.select([fd], [], [], 0.5)
            if fd in r:
                try:
                    data = os.read(fd, 2048)
                    if not data:
                        break
                    output += data
                    if b"password:" in output.lower() and not sent_pass:
                        os.write(fd, VPS_PASS)
                        sent_pass = True
                except OSError:
                    break
        os.waitpid(pid, 0)
        return output.decode("utf-8", errors="replace")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: vps_helper.py <ssh|scp> <args>")
        sys.exit(1)

    action = sys.argv[1]
    if action == "ssh":
        cmd = " ".join(sys.argv[2:])
        print(run_ssh(cmd))
    elif action == "scp":
        local_p = sys.argv[2]
        remote_p = sys.argv[3]
        print(run_scp(local_p, remote_p))
