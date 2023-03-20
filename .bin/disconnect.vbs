Set UAC = CreateObject("Shell.Application")
UAC.ShellExecute "taskkill", "/F /IM openvpn.exe", "", "runas", 0