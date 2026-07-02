# Tests de Feature : Connexion à Ballers Wanted

**Branche de la Feature**: `001-connexion-ballers-wanted`
**Créé le**: 11/06/2026
**INTENT**: Description utilisateur: "INTENT-001 — connexion-utilisateur"
**SPEC**: Description utilisateur: "SPEC-001 - connexion-utilisateur

---

## ÉTAPE 1 — CRÉATION DU COMPTE

$registerResponse = Invoke-RestMethod `
  -Uri "http://localhost:3000/users/register" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{
    "pseudo": "eric",
    "email": "test@test.com",
    "pictoId": "1",
    "consentAccepted": true
  }'

$registerResponse | ConvertTo-Json

---

## ÉTAPE 2 — CONFIRMATION EMAIL

Invoke-RestMethod `
  -Uri "http://localhost:3000/users/confirm/$($registerResponse.confirmationToken)" `
  -Method POST | ConvertTo-Json

---

## ÉTAPE 3 — CONNEXION - REQUEST OTP (test commence par là pour voir la demande d'OTP sur un utilisateur non créé)

$otpResponse = Invoke-RestMethod `
  -Uri "http://localhost:3000/users/otp/request" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"test@test.com"}'

$otpResponse | ConvertTo-Json

---

## ÉTAPE 4 — CONNEXION VERIFY OTP (2 fois pour voir OTP invalide car déjà utilisé)

$body = @{
  email = "test@test.com"
  code  = $otpResponse.code
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:3000/users/otp/verify" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body $body `
  | ConvertTo-Json

---

## ## ÉTAPE 4 BIS — PREPARER UN MAUVAIS CODE

$invalidBody = @{
  email = "test@test.com"
  code  = "000000"
} | ConvertTo-Json

 ---

## ÉTAPE 5 — 3 TENTATIVES

Invoke-RestMethod `
  -Uri "http://localhost:3000/users/otp/verify" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body $invalidBody `
  | ConvertTo-Json

 ---