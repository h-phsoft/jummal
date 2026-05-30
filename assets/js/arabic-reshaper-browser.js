/**
 * Arabic Reshaper for Browser
 * Handles Arabic text shaping for PDF generation
 */
(function(global) {
    'use strict';

    const ArabicReshaper = {
        // Arabic character mappings for reshaping
        isolated: {
            '\u0621': '\uFE80', // HAMZA
            '\u0622': '\uFE81', // ALEF WITH MADDA ABOVE
            '\u0623': '\uFE83', // ALEF WITH HAMZA ABOVE
            '\u0624': '\uFE85', // WAW WITH HAMZA ABOVE
            '\u0625': '\uFE87', // ALEF WITH HAMZA BELOW
            '\u0626': '\uFE89', // YEH WITH HAMZA ABOVE
            '\u0627': '\uFE8D', // ALEF
            '\u0628': '\uFE8F', // BEH
            '\u0629': '\uFE93', // TEH MARBUTA
            '\u062A': '\uFE95', // TEH
            '\u062B': '\uFE97', // THEH
            '\u062C': '\uFE99', // JEEM
            '\u062D': '\uFE9B', // HAH
            '\u062E': '\uFE9D', // KHAH
            '\u062F': '\uFE9F', // DAL
            '\u0630': '\uFEA1', // THAL
            '\u0631': '\uFEA3', // REH
            '\u0632': '\uFEA5', // ZAIN
            '\u0633': '\uFEA7', // SEEN
            '\u0634': '\uFEA9', // SHEEN
            '\u0635': '\uFEAB', // SAD
            '\u0636': '\uFEAD', // DAD
            '\u0637': '\uFEAF', // TAH
            '\u0638': '\uFEB1', // ZAH
            '\u0639': '\uFEB3', // AIN
            '\u063A': '\uFEB5', // GHAIN
            '\u0640': '\u0640', // TATWEEL
            '\u0641': '\uFEB7', // FEH
            '\u0642': '\uFEB9', // QAF
            '\u0643': '\uFEBB', // KAF
            '\u0644': '\uFEBD', // LAM
            '\u0645': '\uFEBF', // MEEM
            '\u0646': '\uFEC1', // NOON
            '\u0647': '\uFEC3', // HEH
            '\u0648': '\uFEE4', // WAW
            '\u0649': '\uFEE5', // ALEF MAKSURA
            '\u064A': '\uFEE7', // YEH
            '\u067E': '\uFB56', // PEH
            '\u0686': '\uFB7A', // TCHEH
            '\u0698': '\uFB8A', // JEH
            '\u06AF': '\uFB92', // GAF
            '\u06A9': '\uFB8E', // KEHEH
            '\u06CC': '\uFBFC', // FARSI YEH
            '\u06D5': '\uFBEA'  // E
        },
        final: {
            '\u0621': '\uFE80', '\u0622': '\uFE82', '\u0623': '\uFE84', '\u0624': '\uFE86',
            '\u0625': '\uFE88', '\u0626': '\uFE8A', '\u0627': '\uFE8E', '\u0628': '\uFE90',
            '\u0629': '\uFE94', '\u062A': '\uFE96', '\u062B': '\uFE98', '\u062C': '\uFE9A',
            '\u062D': '\uFE9C', '\u062E': '\uFE9E', '\u062F': '\uFEA0', '\u0630': '\uFEA2',
            '\u0631': '\uFEA4', '\u0632': '\uFEA6', '\u0633': '\uFEA8', '\u0634': '\uFEAA',
            '\u0635': '\uFEAC', '\u0636': '\uFEAE', '\u0637': '\uFEB0', '\u0638': '\uFEB2',
            '\u0639': '\uFEB4', '\u063A': '\uFEB6', '\u0640': '\u0640', '\u0641': '\uFEB8',
            '\u0642': '\uFEBA', '\u0643': '\uFEBC', '\u0644': '\uFEBE', '\u0645': '\uFEC0',
            '\u0646': '\uFEC2', '\u0647': '\uFEC4', '\u0648': '\uFEE4', '\u0649': '\uFEE6',
            '\u064A': '\uFEEA', '\u067E': '\uFB57', '\u0686': '\uFB7B', '\u0698': '\uFB8B',
            '\u06AF': '\uFB93', '\u06A9': '\uFB8F', '\u06CC': '\uFBFD', '\u06D5': '\uFBEB'
        },
        initial: {
            '\u0621': '\uFE80', '\u0622': '\uFE81', '\u0623': '\uFE83', '\u0624': '\uFE85',
            '\u0625': '\uFE87', '\u0626': '\uFE89', '\u0627': '\uFE8D', '\u0628': '\uFE91',
            '\u0629': '\uFE94', '\u062A': '\uFE97', '\u062B': '\uFE99', '\u062C': '\uFE9B',
            '\u062D': '\uFE9D', '\u062E': '\uFE9F', '\u062F': '\uFEA0', '\u0630': '\uFEA2',
            '\u0631': '\uFEA4', '\u0632': '\uFEA6', '\u0633': '\uFEA9', '\u0634': '\uFEAB',
            '\u0635': '\uFEAD', '\u0636': '\uFEAF', '\u0637': '\uFEB1', '\u0638': '\uFEB3',
            '\u0639': '\uFEB5', '\u063A': '\uFEB7', '\u0640': '\u0640', '\u0641': '\uFEB9',
            '\u0642': '\uFEBB', '\u0643': '\uFEBD', '\u0644': '\uFEBF', '\u0645': '\uFEC1',
            '\u0646': '\uFEC3', '\u0647': '\uFEC5', '\u0648': '\uFEE4', '\u0649': '\uFEE5',
            '\u064A': '\uFEE9', '\u067E': '\uFB58', '\u0686': '\uFB7C', '\u0698': '\uFB8B',
            '\u06AF': '\uFB94', '\u06A9': '\uFB90', '\u06CC': '\uFBFE', '\u06D5': '\uFBEB'
        },
        medial: {
            '\u0621': '\uFE80', '\u0622': '\uFE82', '\u0623': '\uFE84', '\u0624': '\uFE86',
            '\u0625': '\uFE88', '\u0626': '\uFE8A', '\u0627': '\uFE8E', '\u0628': '\uFE92',
            '\u0629': '\uFE94', '\u062A': '\uFE98', '\u062B': '\uFE9A', '\u062C': '\uFE9C',
            '\u062D': '\uFE9E', '\u062E': '\uFEA0', '\u062F': '\uFEA0', '\u0630': '\uFEA2',
            '\u0631': '\uFEA4', '\u0632': '\uFEA6', '\u0633': '\uFEAA', '\u0634': '\uFEAC',
            '\u0635': '\uFEAE', '\u0636': '\uFEB0', '\u0637': '\uFEB2', '\u0638': '\uFEB4',
            '\u0639': '\uFEB6', '\u063A': '\uFEB8', '\u0640': '\u0640', '\u0641': '\uFEBA',
            '\u0642': '\uFEBC', '\u0643': '\uFEBE', '\u0644': '\uFEC0', '\u0645': '\uFEC2',
            '\u0646': '\uFEC4', '\u0647': '\uFEC6', '\u0648': '\uFEE4', '\u0649': '\uFEE6',
            '\u064A': '\uFEEC', '\u067E': '\uFB59', '\u0686': '\uFB7D', '\u0698': '\uFB8B',
            '\u06AF': '\uFB95', '\u06A9': '\uFB91', '\u06CC': '\uFBFF', '\u06D5': '\uFBEB'
        },
        // Characters that don't connect to the left
        nonConnecting: new Set(['\u0621', '\u0622', '\u0623', '\u0624', '\u0625', '\u0626', 
                               '\u0627', '\u062F', '\u0630', '\u0631', '\u0632', '\u0648', 
                               '\u0649', '\u06D5', '\u0629']),
        
        /**
         * Convert Arabic text to shaped form
         * @param {string} text - The Arabic text to reshape
         * @returns {string} - The reshaped text
         */
        convertArabic: function(text) {
            if (!text || typeof text !== 'string') return text;
            
            let result = '';
            const len = text.length;
            
            for (let i = 0; i < len; i++) {
                const char = text[i];
                const prevChar = i > 0 ? text[i - 1] : '';
                const nextChar = i < len - 1 ? text[i + 1] : '';
                
                // Check if current char is Arabic
                if (!this.isArabicChar(char)) {
                    result += char;
                    continue;
                }
                
                // Determine connection state
                const prevConnects = this.canConnectToLeft(prevChar);
                const nextConnects = this.canConnectToRight(nextChar);
                
                let shapedChar;
                if (!prevConnects && !nextConnects) {
                    // Isolated
                    shapedChar = this.isolated[char] || char;
                } else if (!prevConnects && nextConnects) {
                    // Initial
                    shapedChar = this.initial[char] || this.isolated[char] || char;
                } else if (prevConnects && !nextConnects) {
                    // Final
                    shapedChar = this.final[char] || this.isolated[char] || char;
                } else {
                    // Medial
                    shapedChar = this.medial[char] || this.initial[char] || this.isolated[char] || char;
                }
                
                result += shapedChar;
            }
            
            return result;
        },
        
        /**
         * Check if character is Arabic
         */
        isArabicChar: function(char) {
            const code = char.charCodeAt(0);
            return (code >= 0x0600 && code <= 0x06FF) || 
                   (code >= 0x0750 && code <= 0x077F) ||
                   (code >= 0x08A0 && code <= 0x08FF) ||
                   (code >= 0xFB50 && code <= 0xFDFF) ||
                   (code >= 0xFE70 && code <= 0xFEFF);
        },
        
        /**
         * Check if character can connect to the left
         */
        canConnectToLeft: function(char) {
            return this.isArabicChar(char) && !this.nonConnecting.has(char);
        },
        
        /**
         * Check if character can connect to the right
         */
        canConnectToRight: function(char) {
            return this.isArabicChar(char) && !this.nonConnecting.has(char);
        },
        
        /**
         * Process text for PDF display
         * Reshapes Arabic text and reverses it for correct display in jsPDF
         */
        reshape: function(text) {
            const reshaped = this.convertArabic(text);
            // Reverse the reshaped text because jsPDF displays LTR
            return reshaped.split('').reverse().join('');
        }
    };

    // Export for browser
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ArabicReshaper;
    } else {
        global.ArabicReshaper = ArabicReshaper;
    }
})(typeof window !== 'undefined' ? window : this);
