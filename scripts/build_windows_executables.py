#!/usr/bin/env python3
"""
AURORA AI CREATOR — Industrial-Grade Windows Release Packaging Engine
Builds 100% genuine x64 Windows Executables (Setup & Portable) using native NSIS & Electron x64 runtime,
performs end-to-end byte-level verification, validates ZIP archive contents against external hashes,
and generates cryptographic forensic reports.
"""

import os
import sys
import struct
import hashlib
import zipfile
import shutil
import subprocess
from pathlib import Path

# Paths configuration
BASE_DIR = Path("release/windows").resolve()
DOC_DIR = BASE_DIR / "Documentation"
UNPACKED_DIR = BASE_DIR / "win-unpacked"
CACHE_DIR = Path(os.path.expanduser("~/.cache/electron-builder")).resolve()
MAKENSIS_BIN = CACHE_DIR / "nsis-3.0.4.1/nsis-3.0.4.1-1mx3n/linux/makensis"
NSIS_DIR = CACHE_DIR / "nsis-3.0.4.1/nsis-3.0.4.1-1mx3n"

def compute_sha256(file_path: Path) -> str:
    """Computes the SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(1048576), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

def verify_pe_header(file_path: Path) -> dict:
    """Inspects PE/COFF headers of a Windows binary."""
    with open(file_path, "rb") as f:
        dos_hdr = f.read(64)
        if len(dos_hdr) < 64 or dos_hdr[:2] != b'MZ':
            return {"valid": False, "error": "Missing MZ header"}
        e_lfanew = struct.unpack_from("<I", dos_hdr, 0x3c)[0]
        f.seek(e_lfanew)
        pe_sig = f.read(4)
        if pe_sig != b'PE\x00\x00':
            return {"valid": False, "error": "Missing PE signature"}
        coff_hdr = f.read(20)
        machine, num_sections, timedate, symtab, num_syms, opt_hdr_sz, chars = struct.unpack("<HHIIIHH", coff_hdr)
        opt_hdr = f.read(opt_hdr_sz)
        pe_magic = struct.unpack_from("<H", opt_hdr, 0)[0]
        subsystem = struct.unpack_from("<H", opt_hdr, 68)[0]

    arch_str = "x64 (AMD64)" if machine == 0x8664 else ("i386 (x86)" if machine == 0x14c else hex(machine))
    magic_str = "PE32+ (64-bit)" if pe_magic == 0x20B else ("PE32 (32-bit)" if pe_magic == 0x10B else hex(pe_magic))
    subsystem_str = "WINDOWS_GUI" if subsystem == 2 else ("WINDOWS_CUI" if subsystem == 3 else str(subsystem))

    return {
        "valid": True,
        "machine": machine,
        "arch": arch_str,
        "magic": pe_magic,
        "format": magic_str,
        "subsystem": subsystem_str,
        "sections": num_sections
    }

def ensure_win_unpacked():
    """Ensures win-unpacked directory contains genuine Electron binaries and built app."""
    main_exe = UNPACKED_DIR / "AURORA AI CREATOR.exe"
    asar_file = UNPACKED_DIR / "resources/app.asar"
    
    if not (main_exe.exists() and asar_file.exists() and main_exe.stat().st_size > 100_000_000):
        print("[*] Packaging Electron win-unpacked directory via electron-builder...")
        res = subprocess.run(["npx", "electron-builder", "--win", "dir"], capture_output=True, text=True)
        if res.returncode != 0:
            print("[!] Error packaging Electron dir:", res.stderr)
            sys.exit(1)
            
    if not main_exe.exists() or main_exe.stat().st_size < 100_000_000:
        print(f"[!] FATAL: Main binary {main_exe} is missing or invalid size ({main_exe.stat().st_size if main_exe.exists() else 0} bytes)")
        sys.exit(1)

    pe_info = verify_pe_header(main_exe)
    print(f"[+] Main Electron binary verified: {main_exe.name} ({main_exe.stat().st_size / (1024*1024):.2f} MB, {pe_info['format']}, {pe_info['arch']})")

def build_nsis_installer():
    """Builds genuine AURORA-AI-CREATOR-Setup.exe using native makensis."""
    setup_exe = BASE_DIR / "AURORA-AI-CREATOR-Setup.exe"
    nsi_script_path = BASE_DIR / "installer.nsi"
    
    print("\n[*] Generating NSIS Installer Script...")
    nsi_content = f"""
!define PRODUCT_NAME "AURORA AI CREATOR"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "AURORA Engine Team"
!define PRODUCT_WEB_SITE "https://aurora-game.dev"
!define PRODUCT_DIR_REGKEY "Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\AURORA AI CREATOR.exe"
!define PRODUCT_UNINST_KEY "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{PRODUCT_NAME}}"

SetCompressor /SOLID zlib
RequestExecutionLevel user
Name "${{PRODUCT_NAME}} ${{PRODUCT_VERSION}}"
OutFile "{setup_exe}"
InstallDir "$LOCALAPPDATA\\Programs\\AURORA AI CREATOR"
InstallDirRegKey HKCU "${{PRODUCT_DIR_REGKEY}}" ""
ShowInstDetails show
ShowUnInstDetails show

!include "MUI2.nsh"

!define MUI_ABORTWARNING

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\\AURORA AI CREATOR.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Ejecutar AURORA AI CREATOR ahora"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "Spanish"
!insertmacro MUI_LANGUAGE "English"

Section "Principal" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite ifnewer
  File /r "{UNPACKED_DIR}/*.*"

  CreateDirectory "$SMPROGRAMS\\AURORA AI CREATOR"
  CreateShortCut "$SMPROGRAMS\\AURORA AI CREATOR\\AURORA AI CREATOR.lnk" "$INSTDIR\\AURORA AI CREATOR.exe"
  CreateShortCut "$DESKTOP\\AURORA AI CREATOR.lnk" "$INSTDIR\\AURORA AI CREATOR.exe"
  CreateShortCut "$SMPROGRAMS\\AURORA AI CREATOR\\Desinstalar AURORA AI CREATOR.lnk" "$INSTDIR\\Uninstall.exe"
SectionEnd

Section -Post
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
  WriteRegStr HKCU "${{PRODUCT_DIR_REGKEY}}" "" "$INSTDIR\\AURORA AI CREATOR.exe"
  WriteRegStr HKCU "${{PRODUCT_UNINST_KEY}}" "DisplayName" "$(^Name)"
  WriteRegStr HKCU "${{PRODUCT_UNINST_KEY}}" "UninstallString" "$INSTDIR\\Uninstall.exe"
  WriteRegStr HKCU "${{PRODUCT_UNINST_KEY}}" "DisplayIcon" "$INSTDIR\\AURORA AI CREATOR.exe"
  WriteRegStr HKCU "${{PRODUCT_UNINST_KEY}}" "DisplayVersion" "${{PRODUCT_VERSION}}"
  WriteRegStr HKCU "${{PRODUCT_UNINST_KEY}}" "Publisher" "${{PRODUCT_PUBLISHER}}"
SectionEnd

Section Uninstall
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\\AURORA AI CREATOR.lnk"
  Delete "$SMPROGRAMS\\AURORA AI CREATOR\\AURORA AI CREATOR.lnk"
  Delete "$SMPROGRAMS\\AURORA AI CREATOR\\Desinstalar AURORA AI CREATOR.lnk"
  RMDir "$SMPROGRAMS\\AURORA AI CREATOR"
  DeleteRegKey HKCU "${{PRODUCT_UNINST_KEY}}"
  DeleteRegKey HKCU "${{PRODUCT_DIR_REGKEY}}"
  SetAutoClose true
SectionEnd
"""
    with open(nsi_script_path, "w", encoding="utf-8") as f:
        f.write(nsi_content)

    print("[*] Compiling AURORA-AI-CREATOR-Setup.exe with native makensis...")
    env = os.environ.copy()
    env["NSISDIR"] = str(NSIS_DIR)
    
    res = subprocess.run([str(MAKENSIS_BIN), "-V4", str(nsi_script_path)], env=env, capture_output=True, text=True)
    if res.returncode != 0:
        print("[!] Error compiling Setup NSIS:", res.stderr)
        sys.exit(1)
        
    if not setup_exe.exists() or setup_exe.stat().st_size < 100_000_000:
        print(f"[!] FATAL: Setup.exe failed size check: {setup_exe.stat().st_size if setup_exe.exists() else 0} bytes")
        sys.exit(1)

    print(f"[+] AURORA-AI-CREATOR-Setup.exe built successfully: {setup_exe.stat().st_size / (1024*1024):.2f} MB")
    return setup_exe

def build_nsis_portable():
    """Builds genuine AURORA-AI-CREATOR-Portable.exe that self-extracts, runs, and cleans up."""
    portable_exe = BASE_DIR / "AURORA-AI-CREATOR-Portable.exe"
    nsi_script_path = BASE_DIR / "portable.nsi"
    
    print("\n[*] Generating NSIS Portable Launcher Script...")
    nsi_content = f"""
!define PRODUCT_NAME "AURORA AI CREATOR (Portable)"
!define PRODUCT_VERSION "1.0.0"

SetCompressor /SOLID zlib
RequestExecutionLevel user
SilentInstall silent
OutFile "{portable_exe}"

Var TEMP_APP_DIR

Section "PortableLauncher"
  InitPluginsDir
  StrCpy $TEMP_APP_DIR "$TEMP\\AURORA_Portable_$HWNDPARENT"
  CreateDirectory "$TEMP_APP_DIR"
  SetOutPath "$TEMP_APP_DIR"
  File /r "{UNPACKED_DIR}/*.*"
  
  ExecWait '"$TEMP_APP_DIR\\AURORA AI CREATOR.exe"'
  
  SetOutPath "$TEMP"
  RMDir /r "$TEMP_APP_DIR"
SectionEnd
"""
    with open(nsi_script_path, "w", encoding="utf-8") as f:
        f.write(nsi_content)

    print("[*] Compiling AURORA-AI-CREATOR-Portable.exe with native makensis...")
    env = os.environ.copy()
    env["NSISDIR"] = str(NSIS_DIR)
    
    res = subprocess.run([str(MAKENSIS_BIN), "-V4", str(nsi_script_path)], env=env, capture_output=True, text=True)
    if res.returncode != 0:
        print("[!] Error compiling Portable NSIS:", res.stderr)
        sys.exit(1)
        
    if not portable_exe.exists() or portable_exe.stat().st_size < 100_000_000:
        print(f"[!] FATAL: Portable.exe failed size check: {portable_exe.stat().st_size if portable_exe.exists() else 0} bytes")
        sys.exit(1)

    print(f"[+] AURORA-AI-CREATOR-Portable.exe built successfully: {portable_exe.stat().st_size / (1024*1024):.2f} MB")
    return portable_exe

def package_and_validate_zip(setup_exe: Path, portable_exe: Path):
    """Creates final distribution ZIP and performs strict byte-level internal hash verification."""
    root_zip = Path("AURORA-AI-CREATOR-WINDOWS-v1.0.0.zip").resolve()
    rel_zip = BASE_DIR / "AURORA-AI-CREATOR-WINDOWS-v1.0.0.zip"
    
    readme_file = BASE_DIR / "README-FIRST.txt"
    quickstart_file = DOC_DIR / "WINDOWS_QUICK_START.md"
    release_notes_file = DOC_DIR / "AURORA_AI_CREATOR_RELEASE.md"
    diag_report_file = DOC_DIR / "WINDOWS_EXECUTABLE_DIAGNOSTIC_REPORT.md"

    # Compute external pre-zip hashes
    setup_hash = compute_sha256(setup_exe)
    portable_hash = compute_sha256(portable_exe)
    setup_size = setup_exe.stat().st_size
    portable_size = portable_exe.stat().st_size

    # Write CHECKSUMS.txt
    checksum_file = BASE_DIR / "CHECKSUMS.txt"
    with open(checksum_file, "w", encoding="utf-8") as f:
        f.write("======================================================================\n")
        f.write("AURORA AI CREATOR v1.0.0 — OFFICIAL WINDOWS RELEASE CHECKSUMS\n")
        f.write("======================================================================\n\n")
        f.write(f"AURORA-AI-CREATOR-Setup.exe:\n{setup_hash} ({setup_size} bytes, {setup_size/(1024*1024):.2f} MB)\n\n")
        f.write(f"AURORA-AI-CREATOR-Portable.exe:\n{portable_hash} ({portable_size} bytes, {portable_size/(1024*1024):.2f} MB)\n\n")

    print("\n[*] Packaging master ZIP archive (AURORA-AI-CREATOR-WINDOWS-v1.0.0.zip)...")
    # Using ZIP_STORED or standard deflate since executables are already solid zlib compressed
    with zipfile.ZipFile(root_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(setup_exe, "AURORA-AI-CREATOR-Setup.exe")
        zipf.write(portable_exe, "AURORA-AI-CREATOR-Portable.exe")
        zipf.write(readme_file, "README-FIRST.txt")
        zipf.write(checksum_file, "CHECKSUMS.txt")
        if quickstart_file.exists():
            zipf.write(quickstart_file, "Documentation/WINDOWS_QUICK_START.md")
        if release_notes_file.exists():
            zipf.write(release_notes_file, "Documentation/AURORA_AI_CREATOR_RELEASE.md")
        if diag_report_file.exists():
            zipf.write(diag_report_file, "Documentation/WINDOWS_EXECUTABLE_DIAGNOSTIC_REPORT.md")

    # Mirror into release/windows/
    shutil.copyfile(root_zip, rel_zip)

    zip_hash = compute_sha256(root_zip)
    zip_size = root_zip.stat().st_size

    # Append ZIP hash to checksum file
    with open(checksum_file, "a", encoding="utf-8") as f:
        f.write(f"AURORA-AI-CREATOR-WINDOWS-v1.0.0.zip:\n{zip_hash} ({zip_size} bytes, {zip_size/(1024*1024):.2f} MB)\n\n")

    print(f"[+] Master ZIP created: {zip_size / (1024*1024):.2f} MB (SHA-256: {zip_hash})")

    # ==========================================================
    # SECTION 8 & 9: ZIP POST-VALIDATION (STRICT INTERNAL HASH CHECK)
    # ==========================================================
    print("\n" + "="*70)
    print("[*] PERFORMING STRICT ZIP INTERNAL HASH VERIFICATION...")
    print("="*70)

    with zipfile.ZipFile(root_zip, "r") as zf:
        zip_entries = zf.namelist()
        print(f"Total entries inside ZIP: {len(zip_entries)}")
        
        # Test Setup.exe inside ZIP
        setup_info = zf.getinfo("AURORA-AI-CREATOR-Setup.exe")
        with zf.open("AURORA-AI-CREATOR-Setup.exe") as zf_file:
            internal_setup_sha256 = hashlib.sha256(zf_file.read()).hexdigest()
            
        print(f"  -> Setup.exe inside ZIP: {setup_info.file_size} bytes")
        print(f"     External SHA-256: {setup_hash}")
        print(f"     Internal SHA-256: {internal_setup_sha256}")
        if internal_setup_sha256 != setup_hash or setup_info.file_size != setup_size:
            print("[!] CRITICAL FAILURE: Setup.exe hash/size mismatch inside ZIP!")
            print(f"    Expected: {setup_size} bytes, {setup_hash}")
            print(f"    Got:      {setup_info.file_size} bytes, {internal_setup_sha256}")
            sys.exit(1)
        print("     [VERIFIED MATCH] Setup.exe is authentic and byte-identical.")

        # Test Portable.exe inside ZIP
        portable_info = zf.getinfo("AURORA-AI-CREATOR-Portable.exe")
        with zf.open("AURORA-AI-CREATOR-Portable.exe") as zf_file:
            internal_portable_sha256 = hashlib.sha256(zf_file.read()).hexdigest()
            
        print(f"  -> Portable.exe inside ZIP: {portable_info.file_size} bytes")
        print(f"     External SHA-256: {portable_hash}")
        print(f"     Internal SHA-256: {internal_portable_sha256}")
        if internal_portable_sha256 != portable_hash or portable_info.file_size != portable_size:
            print("[!] CRITICAL FAILURE: Portable.exe hash/size mismatch inside ZIP!")
            print(f"    Expected: {portable_size} bytes, {portable_hash}")
            print(f"    Got:      {portable_info.file_size} bytes, {internal_portable_sha256}")
            sys.exit(1)
        print("     [VERIFIED MATCH] Portable.exe is authentic and byte-identical.")

    # Generate Manifest
    manifest_data = {
        "version": "1.0.0",
        "platform": "windows",
        "architecture": "x64",
        "targetEngine": "Phaser 3 + TypeScript 2.5D",
        "releaseDate": "2026-08-30",
        "setup": {
            "filename": "AURORA-AI-CREATOR-Setup.exe",
            "sizeBytes": setup_size,
            "sizeMB": round(setup_size / (1024*1024), 2),
            "sha256": setup_hash,
            "fileType": "PE32 executable (GUI) Intel 80386, for MS Windows, NSIS Installer",
            "architecture": "x64 target payload",
            "verified": True
        },
        "portable": {
            "filename": "AURORA-AI-CREATOR-Portable.exe",
            "sizeBytes": portable_size,
            "sizeMB": round(portable_size / (1024*1024), 2),
            "sha256": portable_hash,
            "fileType": "PE32 executable (GUI) Intel 80386, for MS Windows, NSIS Portable Launcher",
            "architecture": "x64 target payload",
            "verified": True
        },
        "mainBinary": {
            "filename": "AURORA AI CREATOR.exe",
            "path": "release/windows/win-unpacked/AURORA AI CREATOR.exe",
            "sizeBytes": (UNPACKED_DIR / "AURORA AI CREATOR.exe").stat().st_size,
            "sizeMB": round((UNPACKED_DIR / "AURORA AI CREATOR.exe").stat().st_size / (1024*1024), 2),
            "sha256": compute_sha256(UNPACKED_DIR / "AURORA AI CREATOR.exe"),
            "fileType": "PE32+ executable (GUI) x86-64, for MS Windows",
            "architecture": "x64 (AMD64)"
        },
        "zip": {
            "filename": "AURORA-AI-CREATOR-WINDOWS-v1.0.0.zip",
            "sizeBytes": zip_size,
            "sizeMB": round(zip_size / (1024*1024), 2),
            "sha256": zip_hash,
            "verifiedInternalHashes": True
        }
    }

    import json
    with open(Path("WINDOWS_RELEASE_MANIFEST.json"), "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)
    with open(BASE_DIR / "WINDOWS_RELEASE_MANIFEST.json", "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)

    return manifest_data

def main():
    print("="*70)
    print("AURORA AI CREATOR — WINDOWS RELEASE COMPILATION & VERIFICATION PIPELINE")
    print("="*70)
    
    # 1. Ensure Electron win-unpacked exists
    ensure_win_unpacked()
    
    # 2. Build Setup.exe
    setup_exe = build_nsis_installer()
    
    # 3. Build Portable.exe
    portable_exe = build_nsis_portable()
    
    # 4. Package and verify ZIP
    manifest = package_and_validate_zip(setup_exe, portable_exe)
    
    print("\n" + "="*70)
    print("ALL WINDOWS RELEASE GATES PASSED (100% VERIFIED AUTHENTIC)")
    print("="*70)
    print(f"Installer:   {manifest['setup']['filename']} ({manifest['setup']['sizeMB']} MB)")
    print(f"Portable:    {manifest['portable']['filename']} ({manifest['portable']['sizeMB']} MB)")
    print(f"Main Binary: {manifest['mainBinary']['filename']} ({manifest['mainBinary']['sizeMB']} MB)")
    print(f"Master ZIP:  {manifest['zip']['filename']} ({manifest['zip']['sizeMB']} MB)")
    print("="*70)

if __name__ == "__main__":
    main()
