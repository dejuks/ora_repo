 <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MESOB Adaamaa </title>

    <!-- Tailwind & Fonts -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="{{ asset('scripts/qz-tray.js') }}"></script>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('style/kiosk.css') }}">
</head>

<body>
    <div class="container">
        <!-- Header -->
        <div class="header" style="background-color: #2d4997">
            <div class="logo-container">
                <img src="{{ asset('images/mesob.png') }}" alt="Adama City Logo" class="logo">
            </div>
            <h1 class="mesob-title" style="color: white">MESOB Adaamaa Damee Boolee</h1>
                    <!-- Ticket Summary -->
<div class="ticket-summary rounded-md shadow p-4 mb-6 flex justify-around text-center" style="background-color: white">
    <div>
        <h3 class="text-lg font-semibold">Tikkeettii Hanga Ammaa</h3>
        <p id="totalTickets" class="text-2xl font-bold text-gray-800">{{ $totalTickets }}</p>
    </div>
    <div>
        <h3 class="text-lg font-semibold text-green-700">Tikkeettii Guyyaa Har'aa</h3>
        <p id="todayTickets" class="text-2xl font-bold text-gray-800">{{ $todayTickets }}</p>
    </div>
</div>
        </div>

        <!-- Windows Section -->
        <div class="section">
            <h2 class="section-title">
                <i class="fas fa-window-restore" style="color: white"></i>
                Tajaajiloota 
            </h2>
            <div id="windowsList" class="cards-container"></div>
        </div>

        <!-- Priority Selection -->
        <div class="section">
            <h2 class="section-title">
                <i class="fas fa-flag"style="color: white"></i>
                Select Priority
            </h2>
            <div class="priority-options">
                <div class="priority-option priority-normal selected" data-priority="normal">
                    <div class="priority-icon"><i class="fas fa-user"></i></div>
                    <div>
                        <div class="priority-label">Normal</div>
                        <div class="priority-desc">Standard queue priority</div>
                    </div>
                </div>
                <div class="priority-option priority-vip" data-priority="vip">
                    <div class="priority-icon"><i class="fas fa-crown"></i></div>
                    <div>
                        <div class="priority-label">VIP</div>
                        <div class="priority-desc">Priority service for VIPs</div>
                    </div>
                </div>
                <div class="priority-option priority-elderly" data-priority="elderly">
                    <div class="priority-icon"><i class="fas fa-user-friends"></i></div>
                    <div>
                        <div class="priority-label">Elderly</div>
                        <div class="priority-desc">Priority for senior citizens</div>
                    </div>
                </div>
                <div class="priority-option priority-pregnant" data-priority="pregnant">
                    <div class="priority-icon"><i class="fas fa-female"></i></div>
                    <div>
                        <div class="priority-label">Pregnant</div>
                        <div class="priority-desc">Priority for pregnant women</div>
                    </div>
                </div>
            </div>
        </div>
        
 <p class="footer-text text-center mt-4 mb-0" style="color: white">
    Queue Management System<br>
    All rights reserved &copy; AIG Tech {{ date('Y') }} 
 </p>
    </div>

    <!-- Services Modal -->
    <div class="modal hidden" id="servicesModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">
                    <i class="fas fa-list-alt"></i>
                    Tajaajiloota Filadhaa
                </h2>
                <button class="modal-close" id="closeServicesModal"><i class="fas fa-times"></i></button>
            </div>
            <div class="search-bar p-2">
                <input type="text" id="serviceSearch" placeholder="Search services..."
                    class="w-full p-2 rounded border border-gray-300 ">
            </div>
            <div id="servicesList" class="cards-container"></div>
        </div>
    </div>


    <style>
        .hidden {
            display: none !important;
        }

        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .ticket-content {
            background: white;
            border-radius: 0;
            box-shadow: 0 0 0 1px black;
            width: 240px;
            margin: 0 auto;
            padding: 8px;
            color: black;
            font-size: 13px;
            font-family: 'Courier New', monospace;
            line-height: 1.2;
        }

        .ticket-actions {
            display: none;
            justify-content: center;
            gap: 8px;
            margin-top: 12px;
        }

        .btn {
            background: #2563eb;
            color: white;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            border: none;
            cursor: pointer;
            font-family: Arial, sans-serif;
        }

        .btn-secondary {
            background: #6b7280;
        }

        /* Ticket specific styles */
        .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
        }

        .ticket-logo-box {
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            text-align: center;
        }

        .ticket-header-text {
            text-align: center;
            flex-grow: 1;
            font-size: 14px;
            font-weight: bold;
        }

        .ticket-divider {
            border: none;
            border-top: 1px dashed #5f5d5d;
            margin: 8px 0;

        }

        .ticket-field {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }

        .ticket-label {
            font-weight: bold;
        }

        #ticketNumber,
        {
        font-size: 25px !important;
        }

        #ticketNumber,
        #ticketWindow,
        #ticketService,
        #ticketCounter {
            text-align: right;
            flex-grow: 1;
            margin-left: 10px;

        }



        .ticket-footer {
            text-align: center;
            margin-top: 6px;
            color: black;

            font-size: 9px;
        }

        .thanks-text {
            font-weight: bold;
            margin-top: 4px;
            color: black;

        }

        @media print {
            @page {
                size: auto;
                margin: 0;
            }

            body {
                background: white !important;
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            body * {
                visibility: hidden;
                margin: 0 !important;
                padding: 0 !important;
            }

            .modal {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: white !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 9999 !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            .ticket-content,
            .ticket-content * {
                visibility: visible !important;
            }

            .ticket-content {
                position: relative !important;
                width: 540px !important;
                height: auto !important;
                box-shadow: none !important;
                border: 1px solid #000 !important;
                padding: 8px !important;
                margin: 0 auto !important;
                border-radius: 0 !important;
                background: white !important;
                page-break-inside: avoid;
                page-break-after: avoid;
                transform: none !important;
            }

            .ticket-actions {
                display: none !important;
            }

            .container,
            .header,
            .section,
            .modal-content {
                display: none !important;
            }
        }
    </style>

    <!-- ✅ Ticket Modal -->
    <div class="modal hidden" id="ticketModal">
        <div class="ticket-content">
            <div class="header-row">
                <div class="ticket-logo-box">
                    <img src="{{ asset('images/mesob.png') }}" alt="Adama City Logo">
                </div>
                <div class="ticket-header-text">
                    <div>Tikkeettii Masob Adaamaa </div>
                </div>

                <div class="ticket-logo-box">
                    <img src="{{ asset('images/logo.png') }}" alt="Adama City Logo">
                </div>
            </div>
            <div class="ticket-divider"></div>
            <br>
            <div class="ticket-field">
                <span class="ticket-label">Lakk. Tikkeettii:</span>
                <span id="ticketNumber"
                    style="font-size: 20px; font-weight: 600; display: inline;text-align: center;">ADM-001234</span>
            </div>
            <div class="ticket-field">
                <span class="ticket-label">Foddaa:</span>
                <span id="ticketWindow" style="font-weight:600; display: inline;text-align: left;">Foddaa 3</span>
            </div>
            <div class="ticket-field">
                <span class="ticket-label">Tajaajilaa:</span>
                <span id="ticketService" style="font-weight:600; display: inline;text-align: center;">Kaayyoo
                    Gurgurtaa</span>
            </div>
            <div class="ticket-field">
                <span class="ticket-label">Lakk. Ofisaraa:</span>
                <span id="ticketCounter"
                    style="font-size: 20px; font-weight:600; display: inline;text-align: center;">OF-567</span>
            </div>
            <div class="ticket-field">
                <span class="ticket-label">Guyyaa:</span>
                <span id="ticketDate">12/05/2023</span>
            </div>
            <div class="ticket-field">
                <span class="ticket-label">Sa'aatii:</span>
                <span id="ticketTime">10:30 AM</span>
            </div>
            <div class="ticket-footer">
                <div class="thanks-text">Bilbila: 9141</div>
                <div class="thanks-text">www.eservice.adamacity.gov.et</div>
                <div class="thanks-text">Galatoomaa!</div>
            </div>

            <div class="ticket-actions">
                <button class="btn btn-primary" id="printTicketBtn">Print Ticket</button>
                <button class="btn btn-secondary" id="closeTicketBtn">Close</button>
            </div>
        </div>
    </div>

<!-- ❌ REMOVE THIS -->
<!-- <script src="{{ asset('scripts/qz-tray.js') }}"></script> -->

<script>
const windows = @json($windows).sort((b, a) => new Date(b.created_at) - new Date(a.created_at));
let selectedWindow = null;
let selectedService = null;
let selectedPriority = 'normal';
let currentServices = [];

const windowsList = document.getElementById('windowsList');
const servicesModal = document.getElementById('servicesModal');
const servicesList = document.getElementById('servicesList');
const ticketModal = document.getElementById('ticketModal');

const ticketNumber = document.getElementById('ticketNumber');
const ticketWindow = document.getElementById('ticketWindow');
const ticketService = document.getElementById('ticketService');
const ticketCounter = document.getElementById('ticketCounter');
const ticketDate = document.getElementById('ticketDate');
const ticketTime = document.getElementById('ticketTime');


// ============================
// ✅ KIOSK PRINTER FUNCTIONS
// ============================
async function checkPrinterStatus() {
    const res = await fetch("http://localhost:16001/tk-cld-print/public/msPrintGetStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    console.log("Printer Status:", data);

    if (data.code !== 0) throw new Error("Printer API error");

    if (data.content.status_code !== 0) {
        throw new Error(data.content.status_msg);
    }

    return true;
}

async function printTicketKiosk() {
    try {
        await checkPrinterStatus();

        const payload = {
            printCommands: [
                { sequence: 1, command: "SetAlignment", alignment: 1 },

                { sequence: 2, command: "SetBold", bold: 1 },
                { sequence: 3, command: "SetSizetext", widthFactor: 2, heightFactor: 2 },
                { sequence: 4, command: "PrintString", text: "Tikkeettii Masob Adaamaa", lineFeed: 1 },

                { sequence: 5, command: "SetBold", bold: 0 },
                { sequence: 6, command: "SetSizetext", widthFactor: 1, heightFactor: 1 },
                { sequence: 7, command: "SetAlignment", alignment: 0 },

                { sequence: 8, command: "PrintString", text: "--------------------------------", lineFeed: 1 },

                { sequence: 9, command: "PrintString", text: `Lakk. Tikkeettii: ${ticketNumber.textContent}`, lineFeed: 1 },
                { sequence: 10, command: "PrintString", text: `Foddaa: ${ticketWindow.textContent}`, lineFeed: 1 },
                { sequence: 11, command: "PrintString", text: `Tajaajilaa: ${ticketService.textContent}`, lineFeed: 1 },
                { sequence: 12, command: "PrintString", text: `Lakk. Ofisaraa: ${ticketCounter.textContent}`, lineFeed: 1 },
                { sequence: 13, command: "PrintString", text: `Guyyaa: ${ticketDate.textContent}`, lineFeed: 1 },
                { sequence: 14, command: "PrintString", text: `Sa'aatii: ${ticketTime.textContent}`, lineFeed: 1 },

                { sequence: 15, command: "PrintString", text: "--------------------------------", lineFeed: 1 },

                { sequence: 16, command: "SetAlignment", alignment: 1 },
                { sequence: 17, command: "PrintString", text: "Bilbila: 9141", lineFeed: 1 },
                { sequence: 18, command: "PrintString", text: "www.eservice.adamacity.gov.et", lineFeed: 1 },
                { sequence: 19, command: "PrintString", text: "Galatoomaa!", lineFeed: 1 },

                { sequence: 20, command: "PrintFeedline", lines: 4 },
                { sequence: 21, command: "PrintCutpaper", mode: 1 }
            ]
        };

        const res = await fetch("http://localhost:16001/tk-cld-print/public/msPrint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.code !== 0) {
            throw new Error(data.message);
        }

        console.log("✅ Printed successfully!");

    } catch (err) {
        console.error("❌ Print Error:", err);
        alert("Printer Error: " + err.message);
    }
}


// ============================
// UI FUNCTIONS (UNCHANGED)
// ============================
function renderWindows() {
    windowsList.innerHTML = '';
    windows.forEach(w => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <img src="{{ asset('images/mesob.png') }}" class="logo1">
                <div>
                    <div class="card-title">${w.short_name}</div>
                    <p class="text-gray-600 text-sm mt-2">
                        <b style='color:white'>
                        <i class='fa fa-send'></i> Tajaajila ${w.services.length}
                        </b>
                    </p>
                </div>
            </div>`;
        card.onclick = () => selectWindow(w.id);
        windowsList.appendChild(card);
    });
}

function renderServices(services) {
    servicesList.innerHTML = '';
    services.forEach(s => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <div class="card-title">${s.name}</div>
                    <div class="card-subtitle">Foddaa ${selectedWindow.name}</div>
                </div>
            </div>`;
        card.onclick = () => selectService(s.id);
        servicesList.appendChild(card);
    });
}

function selectWindow(id) {
    selectedWindow = windows.find(w => w.id == id);
    currentServices = selectedWindow.services;
    renderServices(currentServices);
    servicesModal.classList.remove('hidden');
}


// ============================
// CREATE TICKET
// ============================
async function createTicket() {
    const payload = {
        service_id: selectedService.id,
        priority: selectedPriority,
        _token: '{{ csrf_token() }}'
    };

    const res = await fetch("{{ route('tickets.store') }}", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const ticket = await res.json();

    ticketNumber.textContent = ticket.ticket_number;
    ticketWindow.textContent = ticket.window_name;
    ticketService.textContent = ticket.service_name;
    ticketCounter.textContent = ticket.counter_name;
}


// ============================
// MAIN FLOW
// ============================
async function selectService(id) {
    selectedService = selectedWindow.services.find(s => s.id == id);
    servicesModal.classList.add('hidden');

    const now = new Date();
    ticketDate.textContent = now.toLocaleDateString();
    ticketTime.textContent = now.toLocaleTimeString();

    ticketModal.classList.remove('hidden');

    await createTicket();

    // ✅ PRINT HERE
    await printTicketKiosk();

    // Auto close
    setTimeout(() => {
        ticketModal.classList.add('hidden');
        renderWindows();
    }, 1500);
}

renderWindows();
</script>
</body>

</html>
