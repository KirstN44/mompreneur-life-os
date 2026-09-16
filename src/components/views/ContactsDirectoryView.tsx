import React, { useState, useMemo } from 'react';
import {
  PhoneCall,
  Phone,
  Mail,
  MapPin,
  Search,
  Plus,
  ShieldAlert,
  Star,
  Users,
  Building,
  Heart,
  Stethoscope,
  GraduationCap,
  Baby,
  Wrench,
  Briefcase,
  Printer,
  Trash2,
  Edit2,
  ExternalLink,
  Copy,
  Check,
  Filter,
  UserCheck,
  FileText,
} from 'lucide-react';
import {
  ContactItem,
  ContactCategory,
  FullPageView,
  ContextMode,
} from '../../types';
import { CONTACT_CATEGORIES, DEFAULT_KID_TAGS } from '../../constants';
import { ModuleNavHeader } from './ModuleNavHeader';
import { Modal } from '../Modal';

interface ContactsDirectoryViewProps {
  contacts: ContactItem[];
  activeMode: ContextMode;
  kidTags?: string[];
  familyKidsMode?: boolean;
  onAddContact: (contact: Omit<ContactItem, 'id'>) => void;
  onUpdateContact: (contact: ContactItem) => void;
  onDeleteContact: (id: number) => void;
  onBackToDashboard: () => void;
  onSwitchView: (view: FullPageView) => void;
}

export const ContactsDirectoryView: React.FC<ContactsDirectoryViewProps> = ({
  contacts,
  activeMode,
  kidTags = DEFAULT_KID_TAGS,
  familyKidsMode = true,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onBackToDashboard,
  onSwitchView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ContactCategory>(familyKidsMode ? 'family' : 'service');
  const [formRelationship, setFormRelationship] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formLandline, setFormLandline] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIsEmergency, setFormIsEmergency] = useState(false);
  const [formKidTag, setFormKidTag] = useState('');

  const handleOpenAddModal = () => {
    setEditingContact(null);
    setFormName('');
    setFormCategory(familyKidsMode ? 'family' : 'service');
    setFormRelationship('');
    setFormMobile('');
    setFormLandline('');
    setFormEmail('');
    setFormAddress('');
    setFormNotes('');
    setFormIsEmergency(false);
    setFormKidTag('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact: ContactItem) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormCategory(contact.category);
    setFormRelationship(contact.relationship || '');
    setFormMobile(contact.mobile || '');
    setFormLandline(contact.landline || '');
    setFormEmail(contact.email || '');
    setFormAddress(contact.address || '');
    setFormNotes(contact.notes || '');
    setFormIsEmergency(!!contact.isEmergencyContact);
    setFormKidTag(contact.kidTag || '');
    setIsModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingContact) {
      onUpdateContact({
        ...editingContact,
        name: formName.trim(),
        category: formCategory,
        relationship: formRelationship.trim() || undefined,
        mobile: formMobile.trim() || undefined,
        landline: formLandline.trim() || undefined,
        email: formEmail.trim() || undefined,
        address: formAddress.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isEmergencyContact: formIsEmergency,
        kidTag: formKidTag.trim() || undefined,
      });
    } else {
      onAddContact({
        name: formName.trim(),
        category: formCategory,
        relationship: formRelationship.trim() || undefined,
        mobile: formMobile.trim() || undefined,
        landline: formLandline.trim() || undefined,
        email: formEmail.trim() || undefined,
        address: formAddress.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isEmergencyContact: formIsEmergency,
        kidTag: formKidTag.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Solopreneur Mode Sanitization (When familyKidsMode is false)
      if (!familyKidsMode) {
        if (
          c.tags?.includes('Leo') ||
          c.tags?.includes('Maya') ||
          c.kidTag === 'Leo' ||
          c.kidTag === 'Maya' ||
          c.kidTag === 'Family / All' ||
          Boolean(c.kidTag) ||
          c.category === 'family' ||
          c.category === 'school' ||
          c.category === 'carer'
        ) {
          return false;
        }
        const rel = (c.relationship || '').toLowerCase();
        const note = (c.notes || '').toLowerCase();
        const name = (c.name || '').toLowerCase();
        if (
          name.includes('pediatrician') ||
          name.includes('school') ||
          name.includes('grandma') ||
          rel.includes('pediatrician') ||
          rel.includes('babysitter') ||
          rel.includes('school') ||
          rel.includes('daycare') ||
          rel.includes('kindergarten') ||
          rel.includes('teacher') ||
          rel.includes('childcare') ||
          rel.includes('leo') ||
          rel.includes('maya') ||
          rel.includes('grandparent') ||
          note.includes('pediatrician') ||
          note.includes('babysitter') ||
          note.includes('leo') ||
          note.includes('maya')
        ) {
          return false;
        }
      }

      if (filterEmergencyOnly && !c.isEmergencyContact) return false;
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.relationship && c.relationship.toLowerCase().includes(q)) ||
        (c.mobile && c.mobile.toLowerCase().includes(q)) ||
        (c.landline && c.landline.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        (c.kidTag && c.kidTag.toLowerCase().includes(q))
      );
    });
  }, [contacts, filterEmergencyOnly, selectedCategory, searchQuery, familyKidsMode]);

  // Emergency VIP Contacts list for top quick card
  const emergencyContacts = useMemo(() => {
    return filteredContacts.filter((c) => c.isEmergencyContact);
  }, [filteredContacts]);

  // Group contacts alphabetically
  const groupedContacts = useMemo(() => {
    const groups: Record<string, ContactItem[]> = {};
    filteredContacts.forEach((c) => {
      const letter = (c.name[0] || '#').toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    });
    return Object.keys(groups)
      .sort()
      .map((letter) => ({
        letter,
        items: groups[letter].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [filteredContacts]);

  return (
    <div className="min-h-screen bg-stone-100/60 pb-16">
      {/* Module Navigation Header */}
      <ModuleNavHeader
        currentView="contacts"
        activeMode={activeMode}
        onBackToDashboard={onBackToDashboard}
        onSwitchView={onSwitchView}
        title="Important Contacts & Directory"
        badgeText={`${contacts.length} Contacts`}
        onPrint={() => window.print()}
        printLabel="Print Directory Sheet"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* Physical Planner Refill Sheet Frame */}
        <div className="planner-paper-sheet border border-stone-200/90 rounded-2xl p-5 sm:p-8 relative">
          {/* Visual Binder Hole Punches on Left (Decorative for planner feel) */}
          <div className="hidden lg:flex flex-col justify-between absolute left-3 top-10 bottom-10 pointer-events-none opacity-40">
            <div className="w-3 h-3 rounded-full bg-stone-300 border border-stone-400/50 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-stone-300 border border-stone-400/50 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-stone-300 border border-stone-400/50 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-stone-300 border border-stone-400/50 shadow-inner" />
          </div>

          <div className="lg:pl-6">
            {/* Sheet Title Block */}
            <div className="border-b-2 border-stone-800 pb-4 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-stone-600 uppercase mb-1">
                  <span>App Workspaces</span>
                  <span>•</span>
                  <span>Section 05</span>
                  <span>•</span>
                  <span>Directory & VIP</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif-heading font-black text-stone-900 tracking-tight">
                  Emergency & Key Contacts
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Essential contacts, key services, and trusted service providers.
                </p>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Contact</span>
                </button>
              </div>
            </div>

            {/* Emergency ICE Highlight Box (Printed prominently at top) */}
            {emergencyContacts.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50/80 border-2 border-rose-300 card-print print-break-inside-avoid">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-rose-200 text-rose-800">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <h2 className="text-xs sm:text-sm font-black text-rose-950 uppercase tracking-wider">
                      🚨 In Case of Emergency (ICE) Quick Reference
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    {emergencyContacts.length} VIP Contacts
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {emergencyContacts.map((c) => (
                    <div
                      key={`ice-${c.id}`}
                      className="p-3 bg-white border border-rose-200 rounded-lg shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h3 className="text-xs font-black text-stone-900 leading-tight">
                            {c.name}
                          </h3>
                          {c.relationship && (
                            <p className="text-[11px] font-semibold text-rose-700">
                              {c.relationship}
                            </p>
                          )}
                        </div>
                        {familyKidsMode && c.kidTag && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {c.kidTag}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-mono space-y-0.5 pt-1 border-t border-stone-100">
                        {c.mobile && (
                          <div className="flex items-center justify-between text-stone-800">
                            <span className="text-[10px] text-stone-600 font-sans font-semibold">Mobile:</span>
                            <a
                              href={`tel:${c.mobile}`}
                              className="font-bold text-rose-900 hover:underline"
                            >
                              {c.mobile}
                            </a>
                          </div>
                        )}
                        {c.landline && (
                          <div className="flex items-center justify-between text-stone-800">
                            <span className="text-[10px] text-stone-600 font-sans font-semibold">Office/Land:</span>
                            <a
                              href={`tel:${c.landline}`}
                              className="font-medium text-stone-700 hover:underline"
                            >
                              {c.landline}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controls Bar: Search & Category Filter Pills (Hidden during printing) */}
            <div className="no-print mb-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Field */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by contact name, phone, address, doctor, or notes..."
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>

                {/* Emergency Toggle Filter */}
                <button
                  type="button"
                  onClick={() => setFilterEmergencyOnly(!filterEmergencyOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    filterEmergencyOnly
                      ? 'bg-rose-100 border-rose-300 text-rose-900 shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>ICE Emergency Only</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CONTACT_CATEGORIES.filter((cat) => {
                  if (!familyKidsMode) {
                    return cat.id !== 'school' && cat.id !== 'family' && cat.id !== 'carer';
                  }
                  return true;
                }).map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const count =
                    cat.id === 'all'
                      ? filteredContacts.length
                      : filteredContacts.filter((c) => c.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-stone-800 text-stone-200' : 'bg-white text-stone-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contacts Table / Grid by Alphabetical Section */}
            {groupedContacts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-600">No contacts found</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Try adjusting your search query or add a new contact to your directory.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Contact</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedContacts.map((group) => (
                  <div key={group.letter} className="print-break-inside-avoid">
                    {/* Alphabet Letter Divider */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-900 text-white text-xs font-black">
                        {group.letter}
                      </span>
                      <div className="h-[1px] flex-1 bg-stone-200" />
                    </div>

                    {/* Contacts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {group.items.map((contact) => (
                        <div
                          key={contact.id}
                          className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs hover:border-stone-300 transition-all card-print"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-sm font-bold text-stone-900">
                                  {contact.name}
                                </h3>
                                {contact.isEmergencyContact && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                    <ShieldAlert className="w-3 h-3" />
                                    <span>ICE</span>
                                  </span>
                                )}
                              </div>

                              {contact.relationship && (
                                <p className="text-xs font-semibold text-stone-600 mt-0.5">
                                  {contact.relationship}
                                </p>
                              )}
                            </div>

                            {/* Tags & Action Buttons */}
                            <div className="flex items-center gap-1">
                              {familyKidsMode && contact.kidTag && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                                  {contact.kidTag}
                                </span>
                              )}

                              <div className="no-print flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(contact)}
                                  className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                                  title="Edit Contact"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteContact(contact.id)}
                                  className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Contact"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Contact Details List */}
                          <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-1.5 text-xs">
                            {/* Mobile Phone */}
                            {contact.mobile && (
                              <div className="flex items-center justify-between">
                                <span className="text-stone-600 flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-rose-700" />
                                  <span>Mobile:</span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={`tel:${contact.mobile}`}
                                    className="font-mono font-bold text-stone-900 hover:text-rose-700 hover:underline"
                                  >
                                    {contact.mobile}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(contact.mobile!, `m-${contact.id}`)}
                                    className="no-print p-0.5 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
                                    title="Copy mobile number"
                                  >
                                    {copiedId === `m-${contact.id}` ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Landline / Office */}
                            {contact.landline && (
                              <div className="flex items-center justify-between">
                                <span className="text-stone-600 flex items-center gap-1.5">
                                  <PhoneCall className="w-3.5 h-3.5 text-blue-700" />
                                  <span>Office / Landline:</span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={`tel:${contact.landline}`}
                                    className="font-mono font-medium text-stone-800 hover:text-blue-700 hover:underline"
                                  >
                                    {contact.landline}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(contact.landline!, `l-${contact.id}`)}
                                    className="no-print p-0.5 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
                                    title="Copy landline number"
                                  >
                                    {copiedId === `l-${contact.id}` ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Email */}
                            {contact.email && (
                              <div className="flex items-center justify-between">
                                <span className="text-stone-600 flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Email:</span>
                                </span>
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="font-medium text-stone-800 hover:text-stone-950 truncate max-w-[220px] hover:underline"
                                >
                                  {contact.email}
                                </a>
                              </div>
                            )}

                            {/* Physical Address */}
                            {contact.address && (
                              <div className="flex items-start justify-between gap-2 pt-0.5">
                                <span className="text-stone-600 flex items-center gap-1.5 shrink-0">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <span>Address:</span>
                                </span>
                                <div className="text-right">
                                  <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(
                                      contact.address
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-stone-800 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>{contact.address}</span>
                                    <ExternalLink className="w-3 h-3 text-stone-400 no-print" />
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Notes / Special Instructions */}
                            {contact.notes && (
                              <div className="mt-2 pt-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100 text-[11px] text-stone-600 leading-relaxed">
                                <span className="font-bold text-stone-700">Notes: </span>
                                <span>{contact.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Printable Footer / Signoff */}
            <div className="mt-8 pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-400 font-mono">
              <span>Mompreneur Life OS • Family Directory Refill Sheet</span>
              <span>Keep updated annually</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add or Edit Contact */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? 'Edit Contact Entry' : 'Add Important Contact'}
      >
        <form onSubmit={handleSaveContact} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Full Name or Institution *
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Dr. Sarah Jenkins or Oakridge Elementary"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ContactCategory)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                <option value="emergency">🚨 Emergency & ICE</option>
                <option value="medical">🩺 Medical & Health</option>
                {familyKidsMode && <option value="school">🎒 School & Teachers</option>}
                {familyKidsMode && <option value="family">❤️ Family & Relatives</option>}
                {familyKidsMode && <option value="carer">🧸 Babysitter / Carer</option>}
                <option value="service">🔧 Home Services & Repairs</option>
                <option value="business">💼 Business & Clients</option>
                <option value="other">📋 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Role / Relationship
              </label>
              <input
                type="text"
                value={formRelationship}
                onChange={(e) => setFormRelationship(e.target.value)}
                placeholder={familyKidsMode ? "e.g., Pediatrician, 2nd Grade Teacher, Babysitter" : "e.g., Accountant, Electrician, Plumber, Client"}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Mobile Phone
              </label>
              <input
                type="tel"
                value={formMobile}
                onChange={(e) => setFormMobile(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Office / Landline Phone
              </label>
              <input
                type="tel"
                value={formLandline}
                onChange={(e) => setFormLandline(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div className={`grid grid-cols-1 ${familyKidsMode ? 'sm:grid-cols-2' : ''} gap-3`}>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            {familyKidsMode && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Child / Family Tag
                </label>
                <select
                  value={formKidTag}
                  onChange={(e) => setFormKidTag(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="">None (General)</option>
                  {kidTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Physical Street Address
            </label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="e.g., 742 Evergreen Terrace, Suite 300"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Notes / Office Hours / Access Codes
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g., Office open 8am-5pm. Gate code #1234. Has spare house keys."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsEmergency}
                onChange={(e) => setFormIsEmergency(e.target.checked)}
                className="w-4 h-4 text-rose-700 rounded border-rose-300 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-rose-950">
                Mark as In Case of Emergency (ICE) VIP Contact (Pinned on Top & Prints at Top)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {editingContact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
