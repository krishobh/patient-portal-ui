import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FileText, ChevronDown, ChevronUp, Plus, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Note {
  id: number;
  date: string;
  content: string;
  consultant?: { name?: string };
}

interface NotesSectionProps {
  notes: Note[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isTherapist?: boolean;
  notesLoading?: boolean;
  notesError?: string | null;
  newNote?: string;
  onNewNoteChange?: (val: string) => void;
  onCreateNote?: (e: React.FormEvent) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ 
  notes, 
  isOpen, 
  onOpenChange,
  isTherapist = false,
  notesLoading = false,
  notesError = null,
  newNote = '',
  onNewNoteChange,
  onCreateNote,
}) => {
  const router = useRouter();
  const { patientId } = router.query;
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    onOpenChange(true);
  };

  const handleAddNote = () => {
    setSelectedNote(null);
    onOpenChange(true);
  };

  const handleCloseModal = () => {
    onOpenChange(false);
    setSelectedNote(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmit = () => {
    handleCloseModal();
  };

  return (
    <>
      <div className="glass-card rounded-xl p-6">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-lg font-bold text-medical-darkGray flex items-center">
            <FileText size={18} className="mr-2 text-medical-teal" />
            Notes
          </h2>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs flex items-center justify-center mr-2 text-medical-teal hover:text-medical-blue transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to all notes page if needed
              }}
            >
              Show All
              <ArrowRight size={14} className="ml-1" />
            </Button>
            {isTherapist && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddNote();
                }}
                className="text-xs flex items-center justify-center mr-3 text-medical-teal hover:text-medical-blue transition-colors"
              >
                <Plus size={14} className="mr-1" />
                Add
              </button>
            )}
            {isExpanded ? (
              <ChevronUp size={18} className="text-medical-text" />
            ) : (
              <ChevronDown size={18} className="text-medical-text" />
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {notesLoading ? (
              <p className="text-sm text-center text-medical-text py-3">Loading notes...</p>
            ) : notesError ? (
              <p className="text-sm text-center text-red-500 py-3">{notesError}</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-center text-medical-text py-3">
                No notes available
              </p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note)}
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow cursor-pointer"
                >
                  <div className="flex items-center">
                    <Clock size={14} className="text-medical-text mr-1" />
                    <p className="text-xs text-medical-text">{formatDate(note.date)}</p>
                    {note.consultant?.name && (
                      <span className="ml-2 text-xs text-medical-blue">{note.consultant.name}</span>
                    )}
                  </div>
                  <p className="text-sm text-medical-darkGray mt-1 line-clamp-2">{note.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-medical-darkGray">
                {selectedNote ? 'Note Details' : 'Add New Note'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-medical-text hover:text-medical-darkGray"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {selectedNote ? (
                <>
                  <div className="mb-4">
                    <div className="flex items-center">
                      <Clock size={14} className="text-medical-text mr-1" />
                      <p className="text-sm text-medical-text">{formatDate(selectedNote.date)}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-medical-lightGray rounded-md">
                    <p className="text-medical-text whitespace-pre-wrap">{selectedNote.content}</p>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleCloseModal}
                      className="secondary-button"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={onCreateNote}>
                  <div>
                    <label htmlFor="note-content" className="block text-sm font-medium text-medical-darkGray mb-1">
                      Note
                    </label>
                    <textarea
                      id="note-content"
                      value={newNote}
                      onChange={e => onNewNoteChange && onNewNoteChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-medical-teal focus:border-medical-teal"
                      placeholder={isTherapist ? "Enter notes about the patient..." : "Enter your notes here..."}
                      rows={6}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="secondary-button"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-button"
                    >
                      Save Note
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotesSection;


