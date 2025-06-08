import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Location } from '../../types';
import { useAsync } from '../../hooks/useAsync';
import { usePagination } from '../../hooks/usePagination';
import { useForm } from '../../hooks/useForm';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

interface SupportTicketsProps {
  locations: Location[];
  selectedLocation: string | null;
}

interface Ticket {
  id: string;
  userId: string;
  username: string;
  email: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
  updatedAt: any;
  locationId: string;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  userId: string;
  username: string;
  isAdmin: boolean;
  message: string;
  createdAt: any;
}

interface TicketFormData {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
}

const SupportTickets: FC<SupportTicketsProps> = ({ locations, selectedLocation }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { execute: loadTickets, loading, error } = useAsync<void>();

  const handleAddTicket = async (formData: TicketFormData) => {
    try {
      await addDoc(collection(db, 'supportTickets'), {
        ...formData,
        locationId: selectedLocation,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: []
      });
      setShowAddModal(false);
      fetchTickets();
    } catch (error) {
      console.error('Error adding ticket:', error);
    }
  };

  const handleReplyTicket = async (formData: { message: string }) => {
    if (!selectedTicket) return;

    try {
      const newReply = {
        message: formData.message,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'supportTickets', selectedTicket.id), {
        replies: [...(selectedTicket.responses || []), newReply],
        updatedAt: new Date()
      });
      setShowReplyModal(false);
      fetchTickets();
    } catch (error) {
      console.error('Error replying to ticket:', error);
    }
  };

  const { values, errors, touched, isSubmitting, handleChange, handleSubmit, resetForm } = useForm<TicketFormData>({
    subject: '',
    message: '',
    priority: 'medium',
    status: 'open',
  }, {
    subject: (value) => !value ? 'Subject is required' : undefined,
    message: (value) => !value ? 'Message is required' : undefined,
  }, handleAddTicket);

  const {
    currentPage,
    totalPages,
    paginationRange,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    getPageItems,
  } = usePagination({
    totalItems: tickets.length,
    pageSize: 10,
  });

  useEffect(() => {
    fetchTickets();
  }, [selectedLocation]);

  const fetchTickets = async () => {
    await loadTickets((async () => {
      const ticketsRef = collection(db, 'supportTickets');
      let q = query(ticketsRef);

      if (selectedLocation) {
        q = query(q, where('locationId', '==', selectedLocation));
      }

      q = query(q, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ticketsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const ticket = { id: doc.id, ...doc.data() } as Ticket;
          
          // Fetch responses for each ticket
          const responsesRef = collection(db, 'supportTickets', doc.id, 'responses');
          const responsesSnapshot = await getDocs(query(responsesRef, orderBy('createdAt', 'asc')));
          ticket.responses = responsesSnapshot.docs.map(responseDoc => ({
            id: responseDoc.id,
            ...responseDoc.data()
          })) as TicketResponse[];
          
          return ticket;
        })
      );
      
      setTickets(ticketsData);
    })());
  };

  const handleStatusChange = async (ticketId: string, newStatus: Ticket['status']) => {
    try {
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        status: newStatus,
        updatedAt: new Date()
      });
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowReplyModal(true);
    resetForm();
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.responses.some(response => response.message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedTickets = getPageItems(filteredTickets);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by subject or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        ticket.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : ticket.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketFormData['status'])}
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        ticket.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : ticket.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : ticket.status === 'closed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.createdAt?.toDate()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={goToPreviousPage}
                disabled={!hasPreviousPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={goToPreviousPage}
                    disabled={!hasPreviousPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <i className="bx bx-chevron-left"></i>
                  </button>
                  {Array.from({ length: paginationRange.end - paginationRange.start + 1 }, (_, i) => (
                    <button
                      key={paginationRange.start + i}
                      onClick={() => goToPage(paginationRange.start + i)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === paginationRange.start + i
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {paginationRange.start + i}
                    </button>
                  ))}
                  <button
                    onClick={goToNextPage}
                    disabled={!hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <i className="bx bx-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Ticket Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Support Ticket"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={values.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.subject && touched.subject ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.subject && touched.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={values.message}
              onChange={(e) => handleChange('message', e.target.value)}
              rows={4}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.message && touched.message ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.message && touched.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={values.priority}
              onChange={(e) => handleChange('priority', e.target.value as TicketFormData['priority'])}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.priority && touched.priority ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && touched.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reply Ticket Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        title="Ticket Details"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{selectedTicket.subject}</h3>
              <p className="mt-1 text-sm text-gray-500">{selectedTicket.responses.map(response => response.message).join('\n')}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Replies</h4>
              {selectedTicket.responses.map((response: TicketResponse, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900">{response.message}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(response.createdAt?.toDate()).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reply</label>
                <textarea
                  value={values.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={4}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.message && touched.message ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.message && touched.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupportTickets; 