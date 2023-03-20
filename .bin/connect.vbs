Set UAC = CreateObject("Shell.Application")
UAC.ShellExecute "C:\Program Files\OpenVPN\bin\openvpn.exe", "--config " & Wscript.Arguments.Item(0), "", "runas", 0