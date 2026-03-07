import React, { useState, useEffect } from 'react';

const ExpenseBuilder = ({ value, onChange }) => {
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');

    // Parse initial value from parent
    useEffect(() => {
        if (!value) {
            setItems([]);
            return;
        }

        const parsedItems = value.split(' | ').map(itemStr => {
            const match = itemStr.match(/(.+?) ₹ (\d+(\.\d+)?)/);
            if (match) {
                return { name: match[1].trim(), price: match[2] };
            }
            return { name: itemStr, price: '' }; // Fallback
        });
        
        // Only update items if it doesn't match the string (prevent loop)
        const currentString = items.map(i => `${i.name} ₹ ${i.price}`).join(' | ');
        if (value !== currentString && value.includes('₹')) {
             setItems(parsedItems.filter(i => i.price));
        } else if (!value.includes('₹') && value.trim() !== '') {
            // Handle legacy single number expenses
            if (!isNaN(value) && items.length === 0) {
               setItems([{ name: 'Misc', price: value }]);
            }
        }
    }, [value]);

    const handleAddItem = (e) => {
        if (e) e.preventDefault();
        if (!currentItem.trim() || !currentPrice.trim()) return;
        
        const newItems = [...items, { name: currentItem.trim(), price: currentPrice.trim() }];
        setItems(newItems);
        setCurrentItem('');
        setCurrentPrice('');
        
        updateParent(newItems);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        updateParent(newItems);
    };

    const updateParent = (currentItems) => {
        const stringValue = currentItems
            .filter(item => item.name && item.price)
            .map(item => `${item.name} ₹ ${item.price}`)
            .join(' | ');
            
        onChange({ target: { name: 'expenses', value: stringValue } });
    };

    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

    return (
        <div className="space-y-3 sm:col-span-2 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest pl-1">
                Expenses
            </label>
            
            {/* List of current items */}
            {items.length > 0 && (
                <div className="space-y-2 mb-3">
                    {items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-zinc-800/50 px-3 py-2 rounded-xl border border-zinc-700/50 text-sm">
                            <span className="text-zinc-300">{item.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-white">₹ {item.price}</span>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                                    aria-label="Remove item"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center px-3 py-2 mt-2 border-t border-zinc-800/50">
                        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Total</span>
                        <span className="text-sm font-bold text-indigo-400">
                            ₹ {total.toString()}
                        </span>
                    </div>
                </div>
            )}
            
            {/* Input fields to add new */}
            <div className="flex gap-2 items-center">
                <input
                    type="text"
                    value={currentItem}
                    onChange={(e) => setCurrentItem(e.target.value)}
                    placeholder="Item (e.g. Food)"
                    className="flex-1 min-w-0 bg-zinc-900/50 text-white text-sm border border-zinc-800 rounded-xl px-3 py-2.5 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-800/50 transition-all"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById('expense-price-input')?.focus();
                        }
                    }}
                />
                <div className="relative w-24 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">₹</span>
                    <input
                        id="expense-price-input"
                        type="number"
                        value={currentPrice}
                        onChange={(e) => setCurrentPrice(e.target.value)}
                        placeholder="0"
                        className="w-full bg-zinc-900/50 text-white text-sm border border-zinc-800 rounded-xl pl-6 pr-2 py-2.5 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-800/50 transition-all"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddItem(e);
                                // focus back to item input after adding
                                setTimeout(() => {
                                    const itemInput = e.target.parentElement.previousElementSibling;
                                    if(itemInput) itemInput.focus();
                                }, 0);
                            }
                        }}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!currentItem.trim() || !currentPrice.trim()}
                    className="bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white disabled:opacity-50 disabled:hover:bg-indigo-500/10 disabled:hover:text-indigo-400 h-[42px] px-3 rounded-xl transition-all flex items-center justify-center shrink-0 border border-indigo-500/20 hover:border-indigo-500"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
        </div>
    );
};

export default ExpenseBuilder;
