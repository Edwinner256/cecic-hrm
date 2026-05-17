// ─── Office Forms & Documents Module ─────────────────────────────
// Handles 13 document types: Equipment Taken Confirmation, Stock Release,
// Asset Transfer, Procurement Tracker, Way Bill, Gate Pass, Procurement Plan,
// Transport Request, Vehicle Log Sheet, Goods Received Note, Stock Card,
// Stores Report, Service Request

const OfficeForms = {
  // ─── Form Type Definitions ─────────────────────────────────
  FORM_TYPES: {
    equipment_taken: {
      label: 'Equipment Taken Confirmation',
      icon: 'bi-tools',
      color: '#0891b2',
      bg: '#cffafe'
    },
    stock_release: {
      label: 'Stock Release Form',
      icon: 'bi-box-seam',
      color: '#16a34a',
      bg: '#dcfce7'
    },
    asset_transfer: {
      label: 'Asset Transfer Form',
      icon: 'bi-arrow-left-right',
      color: '#7c3aed',
      bg: '#f3e8ff'
    },
    procurement_tracker: {
      label: 'Procurement Tracker',
      icon: 'bi-clipboard-data',
      color: '#ea580c',
      bg: '#fff7ed'
    },
    way_bill: {
      label: 'Way Bill',
      icon: 'bi-truck',
      color: '#0e7490',
      bg: '#cffafe'
    },
    gate_pass: {
      label: 'Gate Pass',
      icon: 'bi-door-open',
      color: '#dc2626',
      bg: '#fee2e2'
    },
    procurement_plan: {
      label: 'Procurement Plan',
      icon: 'bi-calendar-range',
      color: '#ca8a04',
      bg: '#fef9c3'
    },
    transport_request: {
      label: 'Transport Request Form',
      icon: 'bi-car-front',
      color: '#0891b2',
      bg: '#cffafe'
    },
    vehicle_log: {
      label: 'Vehicle Log Sheet',
      icon: 'bi-fuel-pump',
      color: '#166534',
      bg: '#f0fdf4'
    },
    goods_received: {
      label: 'Goods Received Note',
      icon: 'bi-clipboard-check',
      color: '#16a34a',
      bg: '#dcfce7'
    },
    stock_card: {
      label: 'Stock Card',
      icon: 'bi-card-list',
      color: '#7c3aed',
      bg: '#f3e8ff'
    },
    stores_report: {
      label: 'Stores Report',
      icon: 'bi-shop',
      color: '#ea580c',
      bg: '#fff7ed'
    },
  },

  async render() {
    const container = document.getElementById('page-officeForms');
    const forms = await DB.getOfficeForms();

    const formTypeCards = Object.entries(this.FORM_TYPES).map(([key, def]) => `
      <div class="stat-card" style="cursor:pointer;transition:all 0.2s;padding:16px" onclick="OfficeForms.showCreateForm('${key}')" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(22,101,52,0.15)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
        <div class="stat-icon" style="background:${def.bg};color:${def.color}"><i class="bi ${def.icon}"></i></div>
        <div class="stat-info">
          <h3 style="font-size:15px">${def.label}</h3>
          <p>Create & print</p>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <h3 style="margin:0">Office Forms & Documents</h3>
        </div>
        <div class="toolbar-right">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" id="ofSearch" placeholder="Search forms..." />
          </div>
          <select class="form-control" id="ofTypeFilter" style="width:auto">
            <option value="">All Forms</option>
            ${Object.entries(this.FORM_TYPES).map(([key, def]) =>
              `<option value="${key}">${def.label}</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div class="card mb-24">
        <div class="card-header"><h3><i class="bi bi-file-earmark-plus"></i> Create New Form</h3></div>
        <div class="card-body">
          <div class="stats-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
            ${formTypeCards}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Previously Created Forms</h3>
        </div>
        <div class="card-body" style="padding:0">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Form #</th>
                  <th>Form Type</th>
                  <th>Title</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Printed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="ofTableBody">
                ${this.renderRows(forms)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('ofSearch').addEventListener('input', () => this.filter());
    document.getElementById('ofTypeFilter').addEventListener('change', () => this.filter());
  },

  renderRows(forms) {
    if (!forms || forms.length === 0) {
      return `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-file-earmark"></i><h3>No Forms Created Yet</h3><p>Click on a form card above to create your first document.</p></div></td></tr>`;
    }

    return forms.map(f => {
      const def = this.FORM_TYPES[f.formType];
      const iconHtml = def
        ? `<span class="badge" style="background:${def.bg};color:${def.color}"><i class="bi ${def.icon}"></i> ${Utils.escapeHtml(def.label)}</span>`
        : `<span class="badge badge-secondary">${Utils.escapeHtml(f.formType)}</span>`;

      const printedInfo = f.printedBy
        ? `<span style="font-size:11px;color:var(--text-muted)">${Utils.escapeHtml(f.printedBy)}<br/><small>${f.printedAt ? Utils.formatDate(f.printedAt) : ''}</small></span>`
        : '<span style="color:var(--text-muted);font-size:11px">—</span>';

      return `<tr>
        <td><strong>${Utils.escapeHtml(f.formNumber || '—')}</strong></td>
        <td>${iconHtml}</td>
        <td>${Utils.escapeHtml(f.title || '—')}</td>
        <td>${Utils.formatDate(f.createdDate)}</td>
        <td><span class="badge ${f.status === 'approved' ? 'badge-success' : f.status === 'draft' ? 'badge-warning' : 'badge-info'}">${f.status || 'draft'}</span></td>
        <td>${printedInfo}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-outline" onclick="OfficeForms.viewForm(${f.id})" title="View"><i class="bi bi-eye-fill"></i></button>
            <button class="btn btn-sm btn-outline" onclick="OfficeForms.printForm(${f.id})" title="Print"><i class="bi bi-printer-fill"></i></button>
            <button class="btn btn-sm btn-danger" onclick="OfficeForms.confirmDelete(${f.id})" title="Delete"><i class="bi bi-trash3"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  async filter() {
    const search = (document.getElementById('ofSearch').value || '').toLowerCase();
    const type = document.getElementById('ofTypeFilter').value;

    let forms = await DB.getOfficeForms();
    if (search) forms = forms.filter(f => (f.title || '').toLowerCase().includes(search) || (f.formNumber || '').toLowerCase().includes(search));
    if (type) forms = forms.filter(f => f.formType === type);

    document.getElementById('ofTableBody').innerHTML = this.renderRows(forms);
  },

  // ─── Generate unique form number ──────────────────────────
  async generateFormNumber(formType) {
    const prefix = formType.split('_').map(w => w[0]).join('').toUpperCase();
    // Use timestamp + random for guaranteed uniqueness across sessions
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substr(2, 3).toUpperCase();
    // Also count existing forms of this type for sequential numbering
    const count = await db.officeForms.where('formType').equals(formType).count();
    const seq = String(count + 1).padStart(3, '0');
    return `${prefix}-${seq}-${ts}`;
  },

  // ─── Show create form modal ──────────────────────────────
  showCreateForm(formType) {
    const def = this.FORM_TYPES[formType];
    if (!def) { Utils.toast('Unknown form type', 'error'); return; }

    // Build the form fields dynamically based on form type
    const fields = this.getFormFields(formType);
    if (!fields) { Utils.toast('Form template not found', 'error'); return; }

    // Remove the title field from the form — title is auto-generated
    const formFields = fields.filter(f => f.name !== 'title');

    Utils.showFormModal({
      title: `Create: ${def.label}`,
      size: 'modal-lg',
      fields: formFields,
      onSubmit: async (data, close) => {
        try {
          data.formType = formType;
          data.formNumber = await this.generateFormNumber(formType);
          // Auto-generate title: "<Form Type Label> - <Serial Number>"
          data.title = `${def.label} - ${data.formNumber}`;
          data.createdDate = Utils.toDateInputValue(new Date());
          data.createdBy = sessionStorage.getItem('hrms_user') || 'Admin';
          data.status = 'draft';
          data.printedBy = '';
          data.printedAt = '';
          data.formData = JSON.stringify(data); // Store full data

          await DB.addOfficeForm(data);
          Utils.toast(`${def.label} #${data.formNumber} created`, 'success');
          close();
          this.render();
        } catch (err) {
          Utils.toast('Error: ' + err.message, 'error');
        }
      }
    });
  },

  // ─── Get form fields for each form type ──────────────────
  getFormFields(formType) {
    const commonFields = [
      { name: 'title', label: 'Form Title', type: 'text', required: true, placeholder: 'Enter form title' }
    ];

    const templates = {
      equipment_taken: [
        ...commonFields,
        { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'equipmentName', label: 'Equipment Name', type: 'text', required: true },
        { name: 'serialNumber', label: 'Serial Number', type: 'text' },
        { name: 'condition', label: 'Condition', type: 'select', required: true, options: [
          { value: 'New', label: 'New' },
          { value: 'Good', label: 'Good' },
          { value: 'Fair', label: 'Fair' },
          { value: 'Needs Repair', label: 'Needs Repair' }
        ]},
        { name: 'takenDate', label: 'Date Taken', type: 'date', required: true, value: Utils.toDateInputValue(new Date()) },
        { name: 'expectedReturn', label: 'Expected Return Date', type: 'date' },
        { name: 'purpose', label: 'Purpose / Reason', type: 'textarea', required: true },
        { name: 'supervisorName', label: 'Supervisor Name', type: 'text', required: true }
      ],

      stock_release: [
        ...commonFields,
        { name: 'releasedTo', label: 'Released To', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'itemName', label: 'Item Name', type: 'text', required: true },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'unit', label: 'Unit of Measure', type: 'select', required: true, options: [
          { value: 'Pieces', label: 'Pieces' },
          { value: 'Boxes', label: 'Boxes' },
          { value: 'Kg', label: 'Kg' },
          { value: 'Litres', label: 'Litres' },
          { value: 'Meters', label: 'Meters' },
          { value: 'Reams', label: 'Reams' },
          { value: 'Other', label: 'Other' }
        ]},
        { name: 'releaseDate', label: 'Release Date', type: 'date', required: true, value: Utils.toDateInputValue(new Date()) },
        { name: 'purpose', label: 'Purpose', type: 'textarea' },
        { name: 'issuedBy', label: 'Issued By', type: 'text', required: true },
        { name: 'receivedBy', label: 'Received By', type: 'text', required: true }
      ],

      asset_transfer: [
        ...commonFields,
        { name: 'assetName', label: 'Asset Name', type: 'text', required: true },
        { name: 'assetTag', label: 'Asset Tag / Serial', type: 'text' },
        { name: 'transferFrom', label: 'Transfer From (Current Location/Dept)', type: 'text', required: true },
        { name: 'transferTo', label: 'Transfer To (New Location/Dept)', type: 'text', required: true },
        { name: 'transferDate', label: 'Transfer Date', type: 'date', required: true, value: Utils.toDateInputValue(new Date()) },
        { name: 'condition', label: 'Asset Condition', type: 'select', options: [
          { value: 'New', label: 'New' },
          { value: 'Good', label: 'Good' },
          { value: 'Fair', label: 'Fair' },
          { value: 'Poor', label: 'Poor' }
        ]},
        { name: 'reason', label: 'Reason for Transfer', type: 'textarea' },
        { name: 'authorizedBy', label: 'Authorized By', type: 'text', required: true },
        { name: 'receivedBy', label: 'Received By', type: 'text', required: true }
      ],

      procurement_tracker: [
        ...commonFields,
        { name: 'itemDescription', label: 'Item Description', type: 'textarea', required: true },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'estimatedCost', label: 'Estimated Cost (UGX)', type: 'number', required: true },
        { name: 'actualCost', label: 'Actual Cost (UGX)', type: 'number' },
        { name: 'supplierName', label: 'Supplier Name', type: 'text', required: true },
        { name: 'requisitionDate', label: 'Requisition Date', type: 'date', required: true, value: Utils.toDateInputValue(new Date()) },
        { name: 'expectedDelivery', label: 'Expected Delivery Date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'Pending', label: 'Pending' },
          { value: 'Approved', label: 'Approved' },
          { value: 'Ordered', label: 'Ordered' },
          { value: 'Delivered', label: 'Delivered' },
          { value: 'Cancelled', label: 'Cancelled' }
        ]},
        { name: 'requestedBy', label: 'Requested By', type: 'text', required: true },
        { name: 'approvedBy', label: 'Approved By', type: 'text' }
      ],

      way_bill: [
        ...commonFields,
        { name: 'consignor', label: 'Consignor (Sender)', type: 'text', required: true },
        { name: 'consignee', label: 'Consignee (Receiver)', type: 'text', required: true },
        { name: 'origin', label: 'Origin', type: 'text', required: true },
        { name: 'destination', label: 'Destination', type: 'text', required: true },
        { name: 'itemDescription', label: 'Items Description', type: 'textarea', required: true },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'weight', label: 'Weight (kg)', type: 'text' },
        { name: 'dispatchDate', label: 'Dispatch Date', type: 'date', required: true, value: Utils.toDateInputValue(new Date()) },
        { name: 'driverName', label: 'Driver Name', type: 'text', required: true },
        { name: 'vehicleReg', label: 'Vehicle Registration', type: 'text', required: true },
        { name: 'receivedBy', label: 'Received By (at destination)', type: 'text' }
      ],

      gate_pass: [
        ...commonFields,
        { name: 'visitorName', label: 'Visitor / Staff Name', type: 'text', required: true },
        { name: 'company', label: 'Company / Organization', type: 'text' },
        { name: 'idNumber', label: 'ID Number', type: 'text' },
        { name: 'purpose', label: 'Purpose of Visit', type: 'textarea', required: true },
        { name: 'personToVisit', label: 'Person to Visit', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text' },
        { name: 'entryDate', label: 'Entry Date', type: 'date', required: true, value: Utils.toDateInputValue(new Date()) },
        { name: 'entryTime', label: 'Entry Time', type: 'text', required: true, placeholder: 'e.g. 09:00' },
        { name: 'exitTime', label: 'Exit Time', type: 'text', placeholder: 'e.g. 17:00' },
        { name: 'itemsCarried', label: 'Items Carried', type: 'textarea' },
        { name: 'authorizedBy', label: 'Authorized By', type: 'text', required: true },
        { name: 'securityOfficer', label: 'Security Officer', type: 'text', required: true }
      ],

      procurement_plan: [
        ...commonFields,
        { name: 'financialYear', label: 'Financial Year', type: 'text', required: true, placeholder: 'e.g. 2026/2027' },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'itemDescription', label: 'Item / Service Description', type: 'textarea', required: true },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'estimatedCost', label: 'Estimated Cost (UGX)', type: 'number', required: true },
        { name: 'procurementMethod', label: 'Procurement Method', type: 'select', options: [
          { value: 'Open Bidding', label: 'Open Bidding' },
          { value: 'Restricted Bidding', label: 'Restricted Bidding' },
          { value: 'Direct Procurement', label: 'Direct Procurement' },
          { value: 'Micro Procurement', label: 'Micro Procurement' },
          { value: 'Framework Contract', label: 'Framework Contract' }
        ]},
        { name: 'plannedDate', label: 'Planned Procurement Date', type: 'date', value: Utils.toDateInputValue(new Date()) },
        { name: 'priority', label: 'Priority', type: 'select', options: [
          { value: 'High', label: 'High' },
          { value: 'Medium', label: 'Medium' },
          { value: 'Low', label: 'Low' }
        ]},
        { name: 'preparedBy', label: 'Prepared By', type: 'text', required: true },
        { name: 'approvedBy', label: 'Approved By', type: 'text' }
      ],

      transport_request: [
        ...commonFields,
        { name: 'requesterName', label: 'Requester Name', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'travelDate', label: 'Travel Date', type: 'date', required: true, value: Utils.toDateInputValue(new Date()) },
        { name: 'departureTime', label: 'Departure Time', type: 'text', required: true, placeholder: 'e.g. 08:00' },
        { name: 'returnTime', label: 'Expected Return Time', type: 'text', placeholder: 'e.g. 17:00' },
        { name: 'origin', label: 'Departure Location', type: 'text', required: true },
        { name: 'destination', label: 'Destination', type: 'text', required: true },
        { name: 'purpose', label: 'Purpose of Trip', type: 'textarea', required: true },
        { name: 'passengers', label: 'Passengers (names)', type: 'textarea' },
        { name: 'vehicleType', label: 'Vehicle Type Required', type: 'select', options: [
          { value: 'Saloon Car', label: 'Saloon Car' },
          { value: 'SUV', label: 'SUV' },
          { value: 'Minibus', label: 'Minibus' },
          { value: 'Truck', label: 'Truck' },
          { value: 'Motorcycle', label: 'Motorcycle' }
        ]},
        { name: 'authorizedBy', label: 'Authorized By', type: 'text', required: true }
      ],

      vehicle_log: [
        ...commonFields,
        { name: 'vehicleReg', label: 'Vehicle Registration', type: 'text', required: true },
        { name: 'vehicleMake', label: 'Vehicle Make & Model', type: 'text' },
        { name: 'driverName', label: 'Driver Name', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true, value: Utils.toDateInputValue(new Date()) },
        { name: 'startOdometer', label: 'Start Odometer (km)', type: 'number', required: true },
        { name: 'endOdometer', label: 'End Odometer (km)', type: 'number', required: true },
        { name: 'distanceTraveled', label: 'Distance Traveled (km)', type: 'number' },
        { name: 'fuelAdded', label: 'Fuel Added (litres)', type: 'number' },
        { name: 'fuelCost', label: 'Fuel Cost (UGX)', type: 'number' },
        { name: 'purpose', label: 'Purpose of Trip', type: 'textarea' },
        { name: 'route', label: 'Route Taken', type: 'text' },
        { name: 'remarks', label: 'Remarks / Issues', type: 'textarea' },
        { name: 'supervisorName', label: 'Supervisor Name', type: 'text', required: true }
      ],

      goods_received: [
        ...commonFields,
        { name: 'receivedFrom', label: 'Received From (Supplier)', type: 'text', required: true },
        { name: 'supplierInvoice', label: 'Supplier Invoice / Reference', type: 'text' },
        { name: 'deliveryNote', label: 'Delivery Note Number', type: 'text' },
        { name: 'receivedDate', label: 'Date Received', type: 'date', required: true, value: Utils.toDateInputValue(new Date()) },
        { name: 'itemDescription', label: 'Item Description', type: 'textarea', required: true },
        { name: 'quantityOrdered', label: 'Quantity Ordered', type: 'number', required: true },
        { name: 'quantityReceived', label: 'Quantity Received', type: 'number', required: true },
        { name: 'quantityDamaged', label: 'Quantity Damaged / Missing', type: 'number', value: '0' },
        { name: 'unit', label: 'Unit of Measure', type: 'text', placeholder: 'Pieces, Boxes, Kg, etc.' },
        { name: 'condition', label: 'Condition on Receipt', type: 'select', options: [
          { value: 'Excellent', label: 'Excellent' },
          { value: 'Good', label: 'Good' },
          { value: 'Fair', label: 'Fair' },
          { value: 'Damaged', label: 'Damaged' }
        ]},
        { name: 'receivedBy', label: 'Received By', type: 'text', required: true },
        { name: 'verifiedBy', label: 'Verified By', type: 'text', required: true }
      ],

      stock_card: [
        ...commonFields,
        { name: 'itemName', label: 'Item Name', type: 'text', required: true },
        { name: 'itemCode', label: 'Item Code / SKU', type: 'text' },
        { name: 'location', label: 'Store Location', type: 'text', required: true },
        { name: 'unit', label: 'Unit of Measure', type: 'text', required: true, placeholder: 'Pieces, Kg, Litres' },
        { name: 'openingBalance', label: 'Opening Balance', type: 'number', required: true },
        { name: 'quantityReceived', label: 'Quantity Received (this period)', type: 'number', value: '0' },
        { name: 'quantityIssued', label: 'Quantity Issued (this period)', type: 'number', value: '0' },
        { name: 'closingBalance', label: 'Closing Balance', type: 'number' },
        { name: 'unitPrice', label: 'Unit Price (UGX)', type: 'number' },
        { name: 'totalValue', label: 'Total Value (UGX)', type: 'number' },
        { name: 'preparedBy', label: 'Prepared By', type: 'text', required: true },
        { name: 'verifiedBy', label: 'Verified By', type: 'text' }
      ],

      stores_report: [
        ...commonFields,
        { name: 'reportPeriod', label: 'Report Period', type: 'text', required: true, placeholder: 'e.g. May 2026' },
        { name: 'storeLocation', label: 'Store Location', type: 'text', required: true },
        { name: 'itemCategory', label: 'Item Category', type: 'text' },
        { name: 'openingStockValue', label: 'Opening Stock Value (UGX)', type: 'number', required: true },
        { name: 'receivedValue', label: 'Value of Goods Received (UGX)', type: 'number', value: '0' },
        { name: 'issuedValue', label: 'Value of Goods Issued (UGX)', type: 'number', value: '0' },
        { name: 'closingStockValue', label: 'Closing Stock Value (UGX)', type: 'number' },
        { name: 'adjustments', label: 'Adjustments / Losses (UGX)', type: 'number', value: '0' },
        { name: 'notes', label: 'Notes / Observations', type: 'textarea' },
        { name: 'preparedBy', label: 'Prepared By', type: 'text', required: true },
        { name: 'approvedBy', label: 'Approved By', type: 'text' }
      ],

    };

    return templates[formType] || null;
  },

  // ─── View a saved form ──────────────────────────────────
  async viewForm(id) {
    const form = await DB.getOfficeForm(id);
    if (!form) { Utils.toast('Form not found', 'error'); return; }

    const def = this.FORM_TYPES[form.formType];
    let formData = {};
    try {
      formData = typeof form.formData === 'string' ? JSON.parse(form.formData) : form.formData;
    } catch (e) {
      formData = form;
    }

    let detailsHtml = '';
    for (const [key, value] of Object.entries(formData)) {
      if (key === 'formData' || key === 'id' || key === 'formType' || key === 'createdDate' || key === 'createdBy' || key === 'printedBy' || key === 'printedAt' || key === 'status') continue;
      if (!value) continue;
      const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      detailsHtml += `
        <div class="detail-item">
          <span class="label">${Utils.escapeHtml(label)}</span>
          <span class="value">${Utils.escapeHtml(String(value))}</span>
        </div>`;
    }

    const iconHtml = def
      ? `<i class="bi ${def.icon}" style="color:${def.color};font-size:24px"></i>`
      : '';

    Utils.showModal({
      title: `${iconHtml} ${Utils.escapeHtml(form.title || 'Form')}`,
      size: 'modal-lg',
      content: `
        <div style="margin-bottom:16px;padding:12px;background:var(--bg);border-radius:var(--radius-sm)">
          <strong>Form #:</strong> ${Utils.escapeHtml(form.formNumber || '—')} &nbsp;|&nbsp;
          <strong>Status:</strong> <span class="badge ${form.status === 'approved' ? 'badge-success' : 'badge-warning'}">${form.status || 'draft'}</span> &nbsp;|&nbsp;
          <strong>Created:</strong> ${Utils.formatDate(form.createdDate)} &nbsp;|&nbsp;
          <strong>By:</strong> ${Utils.escapeHtml(form.createdBy || '—')}
          ${form.printedBy ? `&nbsp;|&nbsp; <strong>Printed:</strong> ${Utils.escapeHtml(form.printedBy)} ${form.printedAt ? 'on ' + Utils.formatDate(form.printedAt) : ''}` : ''}
        </div>
        <div class="detail-grid">
          ${detailsHtml}
        </div>
      `
    });
  },

  // ─── Build print HTML for a form ─────────────────────────
  buildPrintHtml(form, formData, def, company, printedBy, printedAt) {
    const logoHtml = company.companyLogo
      ? `<img src="${Utils.escapeHtml(company.companyLogo)}" style="height:50px;margin-bottom:8px" alt="Logo" />`
      : '';

    let detailsRows = '';
    for (const [key, value] of Object.entries(formData)) {
      if (key === 'formData' || key === 'id' || key === 'formType' || key === 'createdDate' || key === 'createdBy' || key === 'printedBy' || key === 'printedAt' || key === 'status' || key === 'formNumber' || key === 'title') continue;
      if (!value) continue;
      const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      detailsRows += `<tr><td style="font-weight:500;color:#57534e;width:40%">${Utils.escapeHtml(label)}</td><td style="font-weight:600">${Utils.escapeHtml(String(value))}</td></tr>`;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${Utils.escapeHtml(form.title || 'Form')}</title>
  <style>
    @page { margin: 12mm 15mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1a2e05; padding: 20px; max-width: 800px; margin: 0 auto; }
    .cecic-header { text-align: center; margin-bottom: 6px; padding-bottom: 10px; border-bottom: 4px solid #1a365d; }
    .cecic-header .company-name { font-size: 28px; font-weight: 800; letter-spacing: 3px; color: #1a365d; margin: 0; text-transform: uppercase; }
    .cecic-header .company-address { font-size: 10px; color: #57534e; margin-top: 2px; }
    .cecic-header .company-contact { font-size: 9px; color: #78716c; margin-top: 1px; }
    .header { text-align: center; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #d4d4d4; }
    .header .form-type { font-size: 18px; font-weight: 700; color: ${def ? def.color : '#1a365d'}; margin: 0; }
    .header .form-no { font-size: 11px; color: #78716c; margin-top: 2px; }
    .header .form-title { font-size: 13px; font-weight: 500; color: #1a2e05; margin-top: 4px; }
    .meta { background: #f1f5f9; padding: 8px 14px; border-radius: 4px; margin-bottom: 16px; font-size: 10px; color: #57534e; display: flex; justify-content: space-between; }
    table.details { width: 100%; border-collapse: collapse; margin: 12px 0; }
    table.details td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    table.details tr:nth-child(even) td { background: #f8fafc; }
    .signatures { display: flex; justify-content: space-between; margin-top: 36px; padding-top: 16px; }
    .sig-box { width: 45%; }
    .sig-box .line { border-top: 1px solid #1a2e05; margin-top: 32px; padding-top: 4px; }
    .sig-box .name { font-weight: 600; font-size: 12px; }
    .sig-box .title { font-size: 10px; color: #57534e; }
    .sig-box .date-line { margin-top: 12px; font-size: 10px; color: #57534e; border-bottom: 1px solid #57534e; padding-bottom: 2px; display: inline-block; min-width: 120px; }
    .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #d4d4d4; font-size: 9px; color: #78716c; }
    .stamp { text-align: center; margin: 12px 0; font-size: 9px; color: #78716c; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;margin-bottom:16px">
    <button onclick="window.print()" style="padding:8px 24px;background:#166534;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">🖨 Print This Form</button>
    <br/><br/>
  </div>
  <!-- CECIC Branded Letterhead -->
  <div class="cecic-header">
    ${logoHtml}
    <div class="company-name">${Utils.escapeHtml(company.companyName || 'CECIC')}</div>
    <div class="company-address">${Utils.escapeHtml(company.companyAddress || 'Kampala, Uganda')}</div>
    <div class="company-contact">
      ${company.companyEmail ? Utils.escapeHtml(company.companyEmail) + ' &nbsp;|&nbsp; ' : ''}
      ${company.companyPhone ? Utils.escapeHtml(company.companyPhone) : ''}
    </div>
  </div>
  <div class="header">
    <div class="form-type">${def ? Utils.escapeHtml(def.label) : 'Office Form'}</div>
    <div class="form-no">Form #: <strong>${Utils.escapeHtml(form.formNumber || '—')}</strong></div>
    <div class="form-title">${Utils.escapeHtml(form.title || '')}</div>
  </div>
  <div class="meta">
    <span><strong>Date Created:</strong> ${Utils.formatDate(form.createdDate)}</span>
    <span><strong>Created By:</strong> ${Utils.escapeHtml(form.createdBy || '—')}</span>
    <span><strong>Status:</strong> ${(form.status || 'draft').toUpperCase()}</span>
  </div>
  <table class="details">
    ${detailsRows}
  </table>
  <div class="signatures">
    <div class="sig-box">
      <div class="line"></div>
      <div class="name">${Utils.escapeHtml(company.adminDisplayName || 'Authorized Signatory')}</div>
      <div class="title">${Utils.escapeHtml(company.adminTitle || 'Authorized By')}</div>
      <div class="date-line">Date: _________________________</div>
    </div>
    <div class="sig-box" style="text-align:right">
      <div class="line"></div>
      <div class="name">${Utils.escapeHtml(formData.preparedBy || formData.requestedBy || formData.requesterName || 'Staff')}</div>
      <div class="title">Prepared / Requested By</div>
      <div class="date-line">Date: _________________________</div>
    </div>
  </div>
  <div class="stamp">
    Printed by: ${Utils.escapeHtml(printedBy)} | ${new Date(printedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
  </div>
  <div class="footer">
    ${Utils.escapeHtml(company.companyName || 'CECIC')} — ${def ? Utils.escapeHtml(def.label) : 'Office Form'} — ${Utils.escapeHtml(form.formNumber || '')}
    ${company.companyAddress ? `<br/>${Utils.escapeHtml(company.companyAddress)}` : ''}
  </div>
</body>
</html>`;
  },

  // ─── Preview then Print a form ───────────────────────────
  async printForm(id) {
    try {
      const form = await DB.getOfficeForm(id);
      if (!form) { Utils.toast('Form not found', 'error'); return; }

      const def = this.FORM_TYPES[form.formType];
      const company = await DB.getAllSettings();
      const printedBy = sessionStorage.getItem('hrms_user') || 'Unknown';
      const printedAt = new Date().toISOString();

      let formData = {};
      try {
        formData = typeof form.formData === 'string' ? JSON.parse(form.formData) : form.formData;
      } catch (e) {
        formData = form;
      }

      // Build the print HTML
      const html = this.buildPrintHtml(form, formData, def, company, printedBy, printedAt);

      // Show preview modal before printing
      const { close } = Utils.showModal({
        title: `📄 Preview: ${def ? def.label : 'Form'} — ${form.formNumber || ''}`,
        size: 'modal-lg',
        content: `
          <div style="margin-bottom:12px;padding:10px 14px;background:#f0fdf4;border-radius:6px;font-size:13px;color:#166534;display:flex;align-items:center;gap:8px">
            <i class="bi bi-info-circle-fill"></i>
            Preview below — click <strong>Print</strong> to send to printer or <strong>Cancel</strong> to go back.
          </div>
          <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;background:#fff">
            <iframe id="printPreviewFrame" srcdoc="${Utils.escapeHtml(html)}" style="width:100%;height:520px;border:none"></iframe>
          </div>
        `,
        footer: `
          <button class="btn btn-outline" data-cancel>Cancel</button>
          <button class="btn btn-primary" id="doPrintBtn"><i class="bi bi-printer-fill"></i> Print</button>
        `
      });

      // Wire up the Print button
      setTimeout(() => {
        const printBtn = document.getElementById('doPrintBtn');
        if (printBtn) {
          printBtn.addEventListener('click', async () => {
            // Record printing
            await DB.updateOfficeForm(id, { printedBy, printedAt, status: 'printed' });
            close();
            Utils.printHTML(html, `${def ? def.label : 'Form'} - ${form.formNumber || ''}`);
            Utils.toast(`Form printed by ${printedBy}`, 'success');
            this.render();
          });
        }
      }, 50);

    } catch (err) {
      console.error('Form print error:', err);
      Utils.toast('Error printing form: ' + err.message, 'error');
    }
  },

  async confirmDelete(id) {
    const confirmed = await Utils.confirm('Delete this form permanently?', 'Delete Form');
    if (confirmed) {
      await DB.deleteOfficeForm(id);
      Utils.toast('Form deleted', 'success');
      this.render();
    }
  }
};
