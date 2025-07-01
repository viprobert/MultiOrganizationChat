import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTimesCircle, faSpinner, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const MessageInput = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setFilePreview(null);
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        if (message.trim() || selectedFile) {
            if (selectedFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result;
                    let messageType = 'text';
                    if (selectedFile.type.startsWith('image/')) {
                        messageType = 'image';
                    } else if (selectedFile.type.startsWith('audio/')) {
                        messageType = 'audio';
                    } else if (selectedFile.type.startsWith('application/')){
                        messageType = 'document';
                    } else if (selectedFile.type.startsWith('video/')){
                        messageType = 'video';
                    }

                    const fileName = selectedFile.name;
                    const fileType = selectedFile.type;

                    onSendMessage(base64String, messageType, fileName, fileType);
                    handleClearFile();
                    setMessage('');
                };
                reader.onerror = (error) => {
                    console.error("Error reading file:", error);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                onSendMessage(message.trim(), 'text');
                setMessage('');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '1rem', backgroundColor: '#fff', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* File Preview Area */}
            {filePreview && (
                <div style={{ position: 'relative', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9f9f9' }}>
                    {selectedFile.type.startsWith('image/') && (
                        <img src={filePreview} alt="Preview" style={{ maxHeight: '6rem', borderRadius: '0.25rem', objectFit: 'contain' }} />
                    )}
                    {selectedFile.type.startsWith('audio/') && (
                        <audio controls src={filePreview} style={{ width: '100%' }}></audio>
                    )}
                    {selectedFile.type.startsWith('video/') && (
                        <video controls src={filePreview} style={{ width: '200px', height: '200px' }}></video>
                    )}
                    {selectedFile.type.startsWith('document/') && (
                        <video controls src={filePreview} style={{ width: '100%' }}></video>
                    )}

                    <span style={{ marginLeft: '0.75rem', fontSize: '0.875rem', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                        {selectedFile.name}
                    </span>
                    <button
                        type="button"
                        onClick={handleClearFile}
                        style={{
                            position: 'absolute',
                            top: '0.25rem',
                            right: '0.25rem',
                            padding: '0.25rem',
                            color: '#ff4444',
                            border: 'none',
                            background: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '1.25rem'
                        }}
                        title="Remove file"
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/*,audio/*"
                />
                {/* File/Media Upload Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    style={{ padding: '0.5rem', color: '#007bff', border: 'none', background: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '1.25rem' }}
                    title="Attach file"
                    disabled={isLoading}
                >
                    <FontAwesomeIcon icon={faPlusCircle} />
                </button>

                {/* Message Input Field */}
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={selectedFile ? "Add a caption..." : "Type your message..."}
                    style={{
                        flexGrow: 1,
                        padding: '0.5rem 1rem',
                        border: '1px solid #ccc',
                        borderRadius: '0.5rem',
                        transition: 'border-color 0.15s ease-in-out'
                    }}
                    disabled={isLoading}
                />

                {/* Send Button */}
                <button
                    type="submit"
                    style={{
                        backgroundColor: isLoading || (!message.trim() && !selectedFile) ? '#cccccc' : '#007bff',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: '50%',
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        cursor: isLoading || (!message.trim() && !selectedFile) ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                    }}
                    onMouseOver={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#0056b3'; }}
                    onMouseOut={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#007bff'; }}
                    disabled={isLoading || (!message.trim() && !selectedFile)}
                >
                    {isLoading ? (
                        <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '1rem' }} />
                    ) : (
                        <FontAwesomeIcon icon={faArrowRight} />
                    )}
                </button>
            </div>
        </form>
    );
};

export default MessageInput;
