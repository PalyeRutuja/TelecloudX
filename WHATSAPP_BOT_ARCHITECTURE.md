# TelecloudX WhatsApp Bot Architecture

## Overview

TelecloudX allows users to manage cloud servers directly through WhatsApp.

Users can:

* Login
* Deploy VMs
* Check VM status
* Start VMs
* Stop VMs
* Delete VMs
* View billing

All without visiting the website.

---

## Architecture

```text
User
  ↓
WhatsApp Bot
  ↓
TelecloudX Backend
  ↓
Cloud Infrastructure
```

### User

The user sends messages through WhatsApp.

Examples:

```text
LOGIN
DEPLOY
STATUS
STOP
DESTROY
BILLING
```

---

### WhatsApp Bot

The WhatsApp Bot acts as the user interface.

Responsibilities:

* Receive messages
* Understand commands
* Send responses
* Communicate with backend APIs

Example:

```text
User: DEPLOY

Bot:
Choose VM Type

1. Basic
2. Standard
3. Pro
```

---

### TelecloudX Backend

The backend handles all business logic.

Responsibilities:

* Authentication
* VM creation
* VM management
* Billing
* User management

The bot never talks directly to the cloud provider.

All requests go through the backend.

---

### Cloud Infrastructure

The cloud layer performs actual operations:

* Create VM
* Start VM
* Stop VM
* Delete VM
* Monitor resources

---

## User Flow

### Login

```text
User: LOGIN

Bot: Enter Email

User: user@example.com

Bot: Enter OTP

User: 123456

Bot: Login Successful
```

---

### Deploy VM

```text
User: DEPLOY

Bot:
1. Basic
2. Standard
3. Pro

User: 2

Bot:
Select Region

1. Mumbai
2. Singapore

User: 1

Bot:
Confirm Deployment?

User: YES
```

Backend creates the VM.

---

### VM Ready

```text
Bot:

VM Created Successfully

IP: xxx.xxx.xxx.xxx

SSH:
ssh ubuntu@xxx.xxx.xxx.xxx
```

---

## Commands

| Command | Description     |
| ------- | --------------- |
| LOGIN   | Login user      |
| LOGOUT  | Logout user     |
| DEPLOY  | Create VM       |
| STATUS  | Check VM status |
| START   | Start VM        |
| STOP    | Stop VM         |
| RESTART | Restart VM      |
| DESTROY | Delete VM       |
| BILLING | View billing    |
| HELP    | Show commands   |

---

## Project Structure

```text
telecloudx-frontend/
│
├── Landing Page
├── Dashboard
└── Billing

gcx-backend/
│
├── Authentication
├── VM Management
├── Billing
└── APIs

gcx-whatsapp-bot/
│
├── Message Handlers
├── Commands
└── Backend Integration
```

---

## Development Plan

### Phase 1

Build WhatsApp Bot

* Login
* Help
* Deploy
* Status

### Phase 2

Build Backend APIs

* Authentication
* VM APIs
* Billing APIs

### Phase 3

Connect Bot to Backend

```text
WhatsApp Bot
      ↓
GCX Backend
      ↓
Cloud Infrastructure
```

### Phase 4

Add Advanced Features

* UPI Payments
* Crypto Payments
* Notifications
* Analytics
* Admin Panel

---

## Final Goal

A user should be able to create and manage cloud servers entirely through WhatsApp.

```text
User
  ↓
WhatsApp Bot
  ↓
TelecloudX Backend
  ↓
Cloud Infrastructure
```

Simple, fast, and accessible from any phone.

