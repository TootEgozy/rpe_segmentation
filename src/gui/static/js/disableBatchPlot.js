// Define the checkbox class for easier reference
const SELECT_ROW_CHECKBOX_CLS = "select-row-checkbox";

/**
 * Updates the disabled state of the batch "Plot" button.
 * Disables if no checkboxes are selected OR if any selected image does not have masks.
 */
function updateBatchPlotButtonState() {
    console.log("updating plot button")
    const plotButton = document.getElementById('batch-plot-button');
    if (!plotButton) {
        // console.warn("Batch Plot button not found, skipping state update.");
        return; // Exit if the button isn't on the page yet (e.g., during initial load before HTML is ready)
    }

    const checkboxes = document.querySelectorAll(`.${SELECT_ROW_CHECKBOX_CLS}:checked`);
    let disablePlotButton = false;

    // Rule 1: If no checkboxes are selected, disable the button
    if (checkboxes.length === 0) {
        disablePlotButton = true;
    } else {
        // Rule 2: Check if ANY of the selected images does NOT have masks
        for (const checkbox of checkboxes) {
            // Read the data-has-masks attribute (string 'true' or 'false')
            const hasMasks = checkbox.dataset.hasMasks === 'true';
            if (!hasMasks) {
                disablePlotButton = true;
                break; // Found one without masks, no need to check further
            }
        }
    }

    plotButton.disabled = disablePlotButton;
}

/**
 * Client-side function to select/deselect all checkboxes.
 * Called by the "Select all" and "Deselect all" buttons.
 * @param {boolean} select - True to select, false to deselect.
 * @param {string} checkboxClass - The CSS class of the checkboxes.
 */
function selectCheckboxesAction(select, checkboxClass) {
    const checkboxes = document.querySelectorAll(`.${checkboxClass}`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = select;
    });
    // After changing checkboxes, update the plot button state
    updateBatchPlotButtonState();
}


/**
 * Client-side function for HTMX to get selected sample IDs.
 * Used by hx-vals for batch actions.
 * @param {string} checkboxClass - The CSS class of the checkboxes.
 * @returns {string[]} An array of selected sample IDs.
 */
function getSelectedSamples(checkboxClass) {
    const selectedIds = [];
    const checkboxes = document.querySelectorAll(`.${checkboxClass}:checked`);
    checkboxes.forEach(checkbox => {
        selectedIds.push(checkbox.getAttribute("sample_id"));
    });
    return selectedIds;
}


// --- Event Listeners to trigger updateBatchPlotButtonState ---

// 1. On initial page load:
document.addEventListener('DOMContentLoaded', updateBatchPlotButtonState);

// 2. Whenever a checkbox's state changes:
document.addEventListener('change', function(event) {
    // Check if the changed element is one of our sample checkboxes
    if (event.target.classList.contains(SELECT_ROW_CHECKBOX_CLS)) {
        updateBatchPlotButtonState();
    }
});

// 3. After HTMX swaps content (e.g., after an upload, delete, etc.):
// This ensures the button state is correctly re-evaluated for new/updated DOM elements.
document.addEventListener('htmx:afterSwap', function(event) {
    // Only re-evaluate if the swap affected the relevant sections
    // 'home' is your main content div ID
    // 'images-table' is your table ID
    if (event.target.id === 'home' || event.target.id === 'images-table') {
        updateBatchPlotButtonState();
    }
});