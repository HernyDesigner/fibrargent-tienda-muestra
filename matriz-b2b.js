/* Configuración de Productos y Reglas */
/* NOTA: Agregamos la propiedad 'image' para el sidebar */
const products = {
    '070x040': { 
        name: 'Alma - 070x040 cm',
        unitPrice: 26350.29, 
        step: 10,
        packLabel: 'Paquete x 10 unid.',
        image: 'https://darkgrey-porpoise-119211.hostingersite.com/wp-content/uploads/2025/10/almohada-dubella-soft-01.jpg' 
    },
    '070x044': { 
        name: 'Alma - 070x044 cm',
        unitPrice: 31057.31, 
        step: 10,
        packLabel: 'Paquete x 10 unid.',
        image: 'https://darkgrey-porpoise-119211.hostingersite.com/wp-content/uploads/2025/10/almohada-dubella-soft-01.jpg' 
    },
    '070x050': { 
        name: 'Alma - 070x050 cm',
        unitPrice: 34821.25, 
        step: 6,
        packLabel: 'Paquete x 6 unid.',
        image: 'https://darkgrey-porpoise-119211.hostingersite.com/wp-content/uploads/2025/10/almohada-dubella-soft-01.jpg' 
    },
    '080x040': { 
        name: 'Alma - 080x040 cm',
        unitPrice: 24076.84, 
        step: 10,
        packLabel: 'Paquete x 10 unid.',
        image: 'https://darkgrey-porpoise-119211.hostingersite.com/wp-content/uploads/2025/10/almohada-dubella-soft-01.jpg' 
    }
};

const discounts = [
    { minUnits: 400, percentage: 10 },
    { minUnits: 200, percentage: 7 },
    { minUnits: 100, percentage: 4 }
];

/* Utilidades */
function formatCurrency(amount) {
    return '$ ' + amount.toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        .replace(/\.(\d{2})$/, ',$1');
}

function getApplicableDiscount(totalUnits) {
    for (let discount of discounts) {
        if (totalUnits >= discount.minUnits) {
            return discount;
        }
    }
    return null;
}

/* Lógica Principal */

function validateAndCalculate(size, step) {
    const input = document.getElementById(`qty-${size}`);
    let value = parseInt(input.value) || 0;
    
    // Forzar múltiplos
    value = Math.round(value / step) * step;
    if (value < 0) value = 0;
    
    input.value = value;
    updateUI(); 
}

function updateQty(size, change) {
    const input = document.getElementById(`qty-${size}`);
    let currentValue = parseInt(input.value) || 0;
    let newValue = currentValue + change;
    
    if (newValue < 0) newValue = 0;
    
    input.value = newValue;
    updateUI();
}

// Función para eliminar item desde el sidebar (pone cantidad en 0)
function removeItem(size) {
    const input = document.getElementById(`qty-${size}`);
    input.value = 0;
    updateUI();
}

/* Función Maestra de Actualización */
function updateUI() {
    let totalUnits = 0;
    Object.keys(products).forEach(size => {
        const qty = parseInt(document.getElementById(`qty-${size}`).value) || 0;
        totalUnits += qty;
    });
    const currentDiscount = getApplicableDiscount(totalUnits);

    updateProductRows(currentDiscount);
    updateCartPanel(currentDiscount, totalUnits);
}

function updateProductRows(discount) {
    Object.keys(products).forEach(size => {
        const qty = parseInt(document.getElementById(`qty-${size}`).value) || 0;
        const product = products[size];
        const subtotal = qty * product.unitPrice;
        const wrapper = document.getElementById(`total-wrapper-${size}`);

        if (qty > 0) {
            if (discount) {
                const discountedTotal = subtotal * (1 - discount.percentage / 100);
                wrapper.innerHTML = `
                    <div class="row-total discounted">-${formatCurrency(subtotal)} <span class="discount-badge">-${discount.percentage}%</span></div>
                    <div class="row-total final-price">${formatCurrency(discountedTotal)} </div>
                `;
            } else {
                wrapper.innerHTML = `<div class="row-total">${formatCurrency(subtotal)}</div>`;
            }
        } else {
            wrapper.innerHTML = `<div class="row-total" style="color:#999">$ 0,00</div>`;
        }
    });
}

// ESTA FUNCIÓN GENERA EL SIDEBAR EXACTO DE LA MUESTRA
function updateCartPanel(discount, totalUnits) {
    const cartContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountRow = document.getElementById('cart-discount-row');
    const discountPercentEl = document.getElementById('cart-discount-percent');
    const discountAmountEl = document.getElementById('cart-discount-amount');
    const totalEl = document.getElementById('cart-total');
    const cartCountEl = document.getElementById('cart-count');

    let cartHTML = '';
    let grandSubtotal = 0;
    let itemsCount = 0; // Cuenta de líneas de productos

    let hasItems = false;
    Object.keys(products).forEach(size => {
        const qty = parseInt(document.getElementById(`qty-${size}`).value) || 0;
        if (qty > 0) {
            hasItems = true;
            itemsCount++;
            const product = products[size];
            const itemSubtotal = qty * product.unitPrice;
            grandSubtotal += itemSubtotal;

            // HTML Estructura exacta de la imagen: Imagen | Datos | Acciones (Basura + Input)
            cartHTML += `
                <div class="cart-item">
                    <img src="${product.image}" alt="Producto" class="cart-item-img">
                    <div> 
                        <div class="cart-item-details">
                            <span class="cart-item-title">${product.name}, ${product.packLabel}</span>
                            <button class="btn-remove-item" onclick="removeItem('${size}')" title="Eliminar">
                                <i class="bi bi-trash3-fill"></i>
                            </button>
                        </div>

                        <div class="cart-item-actions">
                            <span class="cart-item-price">${formatCurrency(itemSubtotal)}</span>
                            <div class="mini-qty-controls">
                                <button class="mini-qty-btn" onclick="updateQty('${size}', -${product.step})">-</button>
                                <input type="text" class="mini-qty-input" value="${qty}" readonly>
                                <button class="mini-qty-btn" onclick="updateQty('${size}', ${product.step})">+</button>
                            </div>
                        </div>
                    </div>    
                </div>
            `;
        }
    });

    // Actualizar contador del header (número de líneas de items)
    cartCountEl.textContent = itemsCount;

    if (!hasItems) {
        cartContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío.</p>';
    } else {
        cartContainer.innerHTML = cartHTML;
    }

    // Cálculos Finales Footer
    let grandTotal = grandSubtotal;
    let discountAmount = 0;
    let percentageVal = 0;

    // Reiniciamos estilo a Gris (como el de diversidad) por defecto
    discountRow.style.color = '#999'; 
    discountRow.style.fontWeight = '400';

    if (discount) {
        percentageVal = discount.percentage;
        discountAmount = grandSubtotal * (discount.percentage / 100);
        grandTotal = grandSubtotal - discountAmount;
        
        // Si hay descuento: Texto Verde y Negrita
        discountRow.style.color = '#28a745';
        discountRow.style.fontWeight = '600';
    } 

    // Actualizamos SIEMPRE los textos (incluso si es 0%)
    discountPercentEl.textContent = percentageVal + '%';
    discountAmountEl.textContent = '- ' + formatCurrency(discountAmount);
    
    // Nos aseguramos que siempre se vea flex
    discountRow.style.display = 'flex';

    subtotalEl.textContent = formatCurrency(grandSubtotal);
    totalEl.textContent = formatCurrency(grandTotal);
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});


/* Lógica de Pestañas (Tabs) */
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tabs.wc-tabs li a');
    const panels = document.querySelectorAll('.woocommerce-Tabs-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Quitar clase active de todos los tabs y paneles
            document.querySelectorAll('.tabs.wc-tabs li').forEach(li => li.classList.remove('active'));
            panels.forEach(panel => {
                panel.style.display = 'none';
                panel.classList.remove('active');
            });

            // 2. Activar el tab clickeado
            const parentLi = tab.parentElement;
            parentLi.classList.add('active');

            // 3. Mostrar el panel correspondiente
            const targetId = tab.getAttribute('href').substring(1); // quitar el #
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.style.display = 'block';
                targetPanel.classList.add('active');
            }
        });
    });
});