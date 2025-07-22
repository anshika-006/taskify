import { useRef, useState } from 'react';

interface CreateBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateBoard: (name: string, colorTheme: string) => void;
}

export default function CreateBoardModal({ isOpen, onClose, onCreateBoard }: CreateBoardModalProps) {
    const [selectedTheme, setSelectedTheme] = useState('purple');
    const nameRef = useRef<HTMLInputElement>(null);

    const colorThemes = [
        { value: 'purple', color: 'bg-purple-600' },
        { value: 'blue', color: 'bg-blue-600' },
        { value: 'green', color: 'bg-green-600' },
        { value: 'orange', color: 'bg-orange-600' },
        { value: 'red', color: 'bg-red-600' },
        { value: 'pink', color: 'bg-pink-600' },
        { value: 'teal', color: 'bg-teal-600' }
    ];

    const handleCreate = () => {
        const name = nameRef.current?.value;
        if (!name) {
            alert("Please enter a board name");
            return;
        }
        onCreateBoard(name, selectedTheme);
        onClose();
    };

    const getPreviewStyle = () => {
        const gradients: { [key: string]: string } = {
            purple: 'bg-gradient-to-br from-purple-600 to-purple-800',
            blue: 'bg-gradient-to-br from-blue-600 to-blue-800',
            green: 'bg-gradient-to-br from-green-600 to-green-800',
            orange: 'bg-gradient-to-br from-orange-600 to-orange-800',
            red: 'bg-gradient-to-br from-red-600 to-red-800',
            pink: 'bg-gradient-to-br from-pink-600 to-pink-800',
            teal: 'bg-gradient-to-br from-teal-600 to-teal-800'
        };
        return gradients[selectedTheme] || gradients.purple;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg w-96 max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-white text-lg font-semibold">Create board</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Board Preview */}
                    <div className="relative">
                        <div className={`w-full h-32 rounded-lg ${getPreviewStyle()} relative overflow-hidden`}>
                            {/* Mini kanban preview */}
                            <div className="absolute inset-4 flex space-x-2">
                                <div className="flex-1 bg-white/90 rounded p-2">
                                    <div className="h-2 bg-gray-300 rounded mb-1"></div>
                                    <div className="h-1 bg-gray-200 rounded mb-1"></div>
                                    <div className="h-1 bg-gray-200 rounded"></div>
                                </div>
                                <div className="flex-1 bg-white/90 rounded p-2">
                                    <div className="h-2 bg-gray-300 rounded mb-1"></div>
                                    <div className="h-1 bg-gray-200 rounded"></div>
                                </div>
                                <div className="flex-1 bg-white/90 rounded p-2">
                                    <div className="h-2 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Selection */}
                    <div>
                        <h3 className="text-white text-sm font-medium mb-2">Background</h3>
                        
                        {/* Color Themes */}
                        <div className="grid grid-cols-7 gap-2">
                            {colorThemes.map((theme) => (
                                <button
                                    key={theme.value}
                                    onClick={() => setSelectedTheme(theme.value)}
                                    className={`h-8 w-8 rounded ${theme.color} border-2 transition-all ${
                                        selectedTheme === theme.value
                                            ? 'border-white scale-110' 
                                            : 'border-transparent hover:border-gray-400'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Board Title */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Board title <span className="text-red-400">*</span>
                        </label>
                        <input
                            ref={nameRef}
                            type="text"
                            placeholder="Board title"
                            className="w-full p-3 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                        />
                        <p className="text-yellow-400 text-xs mt-1">👋 Board title is required</p>
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">Visibility</label>
                        <select className="w-full p-3 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none">
                            <option value="workspace">Workspace</option>
                            <option value="private">Private</option>
                            <option value="public">Public</option>
                        </select>
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={handleCreate}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition-colors"
                    >
                        Create
                    </button>

                    {/* Template Option */}
                    <button className="w-full text-gray-400 hover:text-white py-2 text-sm transition-colors">
                        Start with a template
                    </button>
                </div>
            </div>
        </div>
    );
}