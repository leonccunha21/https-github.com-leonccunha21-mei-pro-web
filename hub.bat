@echo off
chcp 65001 >nul
cd /d "%~dp0"
title HUB - Gestao.PRO

:menu
cls
echo.
echo  ======================================================
echo    HUB DE SCRIPTS - GESTAO.PRO
echo  ======================================================
echo.
echo   1. Gerar planilha editavel (Excel)
echo   2. Importar planilha para o app (Excel -^> banco)
echo   3. Gerar backup Excel
echo   4. Git: status
echo   5. Git: pull (atualizar do GitHub)
echo   6. Git: commit + push (enviar para o GitHub)
echo   7. Bot: ajuda
echo   0. Sair
echo.
set /p op=Escolha uma opcao: 

if "%op%"=="1" goto g_plan
if "%op%"=="2" goto g_imp
if "%op%"=="3" goto g_bkp
if "%op%"=="4" goto g_st
if "%op%"=="5" goto g_pl
if "%op%"=="6" goto g_ps
if "%op%"=="7" goto g_bot
if "%op%"=="0" goto end
echo.
echo  Opcao invalida.
pause
goto menu

:g_plan
echo.
echo  [1] Gerando planilha editavel...
node scripts/gerar_planilha.cjs
pause
goto menu

:g_imp
echo.
echo  [2] Importando planilha para o app...
node scripts/importar_base2.cjs
pause
goto menu

:g_bkp
echo.
echo  [3] Gerando backup Excel...
node scripts/gerar_backup_excel.cjs
pause
goto menu

:g_st
echo.
echo  [4] Git status...
git status
pause
goto menu

:g_pl
echo.
echo  [5] Git pull...
git pull origin main
pause
goto menu

:g_ps
echo.
echo  [6] Git commit + push...
set /p msg=Mensagem do commit: 
git add -A
git commit -m "%msg%"
git push origin main
pause
goto menu

:g_bot
echo.
echo  [7] Bot ajuda...
node scripts/bot.cjs help
pause
goto menu

:end
exit
