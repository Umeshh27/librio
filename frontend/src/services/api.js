import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  timeout: 8000,
});

// Helper to convert plain object to URLSearchParams for application/x-www-form-urlencoded
export const toFormData = (data) => {
  const params = new URLSearchParams();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      params.append(key, String(data[key]));
    }
  });
  return params;
};

// ==========================================
// PREVIEW SEED DATA (Indian Patrons & Context)
// ==========================================
export const PREVIEW_DATA = {
  dashboard: {
    totalBooks: 48,
    availableBooks: 39,
    issuedBooks: 9,
    totalMembers: 24,
    monthlyBorrowing: [
      { month: 'Jun', count: 18 },
      { month: 'Jul', count: 25 },
      { month: 'Aug', count: 21 },
      { month: 'Sep', count: 34 },
      { month: 'Oct', count: 42 },
      { month: 'Nov', count: 28 },
    ],
    categories: [
      { name: 'Computer Science', count: 16 },
      { name: 'Fiction & Literature', count: 12 },
      { name: 'Mathematics', count: 8 },
      { name: 'Science & Nature', count: 7 },
      { name: 'Business & Finance', count: 5 },
    ],
    popularBooks: [
      { title: 'Clean Code: A Handbook', author: 'Robert C. Martin', borrows: 24 },
      { title: 'Design Patterns: GoF', author: 'Erich Gamma et al.', borrows: 19 },
      { title: 'The Pragmatic Programmer', author: 'David Thomas', borrows: 17 },
      { title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen', borrows: 14 },
      { title: 'Designing Data-Intensive Apps', author: 'Martin Kleppmann', borrows: 12 },
    ],
    recentActivities: [
      {
        id: 1,
        type: 'ISSUE',
        description: 'Issued "Clean Architecture" to Aarav Sharma',
        date: 'Today, 02:40 PM',
      },
      {
        id: 2,
        type: 'RETURN',
        description: 'Returned "Deep Work" by Priya Patel (₹0 fine)',
        date: 'Today, 11:15 AM',
      },
      {
        id: 3,
        type: 'BOOK',
        description: 'Added 5 new copies of "System Design Interview"',
        date: 'Yesterday, 04:30 PM',
      },
      {
        id: 4,
        type: 'MEMBER',
        description: 'Enrolled new patron: Vikram Malhotra',
        date: 'Nov 02, 2026',
      },
    ],
  },
  books: [
    {
      id: 1,
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Computer Science',
      totalCopies: 6,
      availableCopies: 5,
      createdAt: '2026-08-01',
    },
    {
      id: 2,
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      isbn: '978-0201633610',
      category: 'Computer Science',
      totalCopies: 5,
      availableCopies: 4,
      createdAt: '2026-08-05',
    },
    {
      id: 3,
      title: 'The Pragmatic Programmer: Your Journey To Mastery',
      author: 'David Thomas, Andrew Hunt',
      isbn: '978-0135957059',
      category: 'Computer Science',
      totalCopies: 4,
      availableCopies: 4,
      createdAt: '2026-08-10',
    },
    {
      id: 4,
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
      isbn: '978-0262033848',
      category: 'Mathematics',
      totalCopies: 8,
      availableCopies: 8,
      createdAt: '2026-08-15',
    },
    {
      id: 5,
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      category: 'Computer Science',
      totalCopies: 7,
      availableCopies: 6,
      createdAt: '2026-08-20',
    },
    {
      id: 6,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0060935467',
      category: 'Fiction & Literature',
      totalCopies: 5,
      availableCopies: 5,
      createdAt: '2026-08-25',
    },
    {
      id: 7,
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0451524935',
      category: 'Fiction & Literature',
      totalCopies: 6,
      availableCopies: 6,
      createdAt: '2026-09-01',
    },
    {
      id: 8,
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '978-0062316097',
      category: 'Science & Nature',
      totalCopies: 4,
      availableCopies: 4,
      createdAt: '2026-09-05',
    },
    {
      id: 9,
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      isbn: '978-0374533557',
      category: 'Business & Finance',
      totalCopies: 4,
      availableCopies: 4,
      createdAt: '2026-09-10',
    },
    {
      id: 10,
      title: 'Atomic Habits',
      author: 'James Clear',
      isbn: '978-0735211292',
      category: 'Business & Finance',
      totalCopies: 5,
      availableCopies: 5,
      createdAt: '2026-09-15',
    },
    {
      id: 11,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      category: 'Fiction & Literature',
      totalCopies: 4,
      availableCopies: 4,
      createdAt: '2026-09-20',
    },
    {
      id: 12,
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0553380163',
      category: 'Science & Nature',
      totalCopies: 3,
      availableCopies: 3,
      createdAt: '2026-09-25',
    },
  ],
  members: [
    {
      id: 1,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@iitd.ac.in',
      phone: '+91 98201 44521',
      registrationDate: '2026-08-15',
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya.patel@iitb.ac.in',
      phone: '+91 98112 33456',
      registrationDate: '2026-08-20',
    },
    {
      id: 3,
      name: 'Rohan Verma',
      email: 'rohan.verma@bits-pilani.ac.in',
      phone: '+91 97234 55678',
      registrationDate: '2026-09-01',
    },
    {
      id: 4,
      name: 'Ananya Iyer',
      email: 'ananya.iyer@iisc.ac.in',
      phone: '+91 94456 77890',
      registrationDate: '2026-09-12',
    },
    {
      id: 5,
      name: 'Vikram Malhotra',
      email: 'vikram.malhotra@iitm.ac.in',
      phone: '+91 99887 66554',
      registrationDate: '2026-09-28',
    },
    {
      id: 6,
      name: 'Sneha Reddy',
      email: 'sneha.reddy@uohyd.ac.in',
      phone: '+91 98490 12345',
      registrationDate: '2026-10-05',
    },
  ],
  loans: [
    {
      id: 1,
      bookId: 1,
      bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      bookIsbn: '978-0132350884',
      memberId: 1,
      memberName: 'Aarav Sharma',
      memberEmail: 'aarav.sharma@iitd.ac.in',
      memberPhone: '+91 98201 44521',
      issueDate: '2026-10-10',
      dueDate: '2026-10-24',
      returnDate: null,
      status: 'OVERDUE',
      fineAmount: 55.0,
      daysOverdue: 11,
    },
    {
      id: 2,
      bookId: 2,
      bookTitle: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      bookIsbn: '978-0201633610',
      memberId: 2,
      memberName: 'Priya Patel',
      memberEmail: 'priya.patel@iitb.ac.in',
      memberPhone: '+91 98112 33456',
      issueDate: '2026-10-28',
      dueDate: '2026-11-11',
      returnDate: null,
      status: 'ISSUED',
      fineAmount: 0.0,
      daysOverdue: 0,
    },
    {
      id: 3,
      bookId: 5,
      bookTitle: 'Designing Data-Intensive Applications',
      bookIsbn: '978-1449373320',
      memberId: 3,
      memberName: 'Rohan Verma',
      memberEmail: 'rohan.verma@bits-pilani.ac.in',
      memberPhone: '+91 97234 55678',
      issueDate: '2026-11-01',
      dueDate: '2026-11-15',
      returnDate: null,
      status: 'ISSUED',
      fineAmount: 0.0,
      daysOverdue: 0,
    },
    {
      id: 4,
      bookId: 3,
      bookTitle: 'The Pragmatic Programmer: Your Journey To Mastery',
      bookIsbn: '978-0135957059',
      memberId: 4,
      memberName: 'Ananya Iyer',
      memberEmail: 'ananya.iyer@iisc.ac.in',
      memberPhone: '+91 94456 77890',
      issueDate: '2026-09-10',
      dueDate: '2026-09-24',
      returnDate: '2026-09-22',
      status: 'RETURNED',
      fineAmount: 0.0,
      daysOverdue: 0,
    },
    {
      id: 5,
      bookId: 4,
      bookTitle: 'Introduction to Algorithms (CLRS)',
      bookIsbn: '978-0262033848',
      memberId: 5,
      memberName: 'Vikram Malhotra',
      memberEmail: 'vikram.malhotra@iitm.ac.in',
      memberPhone: '+91 99887 66554',
      issueDate: '2026-09-15',
      dueDate: '2026-09-29',
      returnDate: '2026-10-02',
      status: 'RETURNED',
      fineAmount: 15.0,
      daysOverdue: 3,
    },
    {
      id: 6,
      bookId: 12,
      bookTitle: 'A Brief History of Time',
      bookIsbn: '978-0553380163',
      memberId: 6,
      memberName: 'Sneha Reddy',
      memberEmail: 'sneha.reddy@uohyd.ac.in',
      memberPhone: '+91 98490 12345',
      issueDate: '2026-09-20',
      dueDate: '2026-10-04',
      returnDate: '2026-10-04',
      status: 'RETURNED',
      fineAmount: 0.0,
      daysOverdue: 0,
    },
  ],
};

// ==========================================
// API WRAPPER WITH GRACEFUL FALLBACK
// ==========================================
export const api = {
  checkHealth: async () => {
    try {
      const res = await apiClient.get('/health');
      return res.data;
    } catch {
      return { success: true, message: 'Preview Mode (Connecting to Java...)' };
    }
  },

  getDashboard: async () => {
    try {
      const res = await apiClient.get('/dashboard');
      return res.data;
    } catch {
      return { success: true, data: PREVIEW_DATA.dashboard };
    }
  },

  getBooks: async (params = {}) => {
    try {
      const res = await apiClient.get('/books', { params });
      return res.data;
    } catch {
      return { success: true, data: PREVIEW_DATA.books };
    }
  },
  getBookById: async (id) => {
    try {
      const res = await apiClient.get(`/books/${id}`);
      return res.data;
    } catch {
      const book = PREVIEW_DATA.books.find((b) => b.id === Number(id));
      return { success: true, data: book };
    }
  },
  addBook: async (bookData) => {
    try {
      const res = await apiClient.post('/books', toFormData(bookData));
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw err;
    }
  },
  updateBook: async (id, bookData) => {
    try {
      const res = await apiClient.put(`/books/${id}`, toFormData(bookData));
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw err;
    }
  },
  deleteBook: async (id) => {
    try {
      const res = await apiClient.delete(`/books/${id}`);
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw err;
    }
  },

  getMembers: async (params = {}) => {
    try {
      const res = await apiClient.get('/members', { params });
      return res.data;
    } catch {
      return { success: true, data: PREVIEW_DATA.members };
    }
  },
  getMemberById: async (id) => {
    try {
      const res = await apiClient.get(`/members/${id}`);
      return res.data;
    } catch {
      const member = PREVIEW_DATA.members.find((m) => m.id === Number(id));
      return { success: true, data: member };
    }
  },
  addMember: async (memberData) => {
    try {
      const res = await apiClient.post('/members', toFormData(memberData));
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw err;
    }
  },
  updateMember: async (id, memberData) => {
    try {
      const res = await apiClient.put(`/members/${id}`, toFormData(memberData));
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw err;
    }
  },
  deleteMember: async (id) => {
    try {
      const res = await apiClient.delete(`/members/${id}`);
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw err;
    }
  },

  getLoans: async (params = {}) => {
    try {
      const res = await apiClient.get('/loans', { params });
      return res.data;
    } catch {
      return { success: true, data: PREVIEW_DATA.loans };
    }
  },
  getActiveLoans: async () => {
    try {
      const res = await apiClient.get('/loans/active');
      return res.data;
    } catch {
      const active = PREVIEW_DATA.loans.filter((l) => l.status !== 'RETURNED');
      return { success: true, data: active };
    }
  },
  getBorrowingHistory: async () => {
    try {
      const res = await apiClient.get('/loans/history');
      return res.data;
    } catch {
      return { success: true, data: PREVIEW_DATA.loans };
    }
  },
  getOverdueLoans: async () => {
    try {
      const res = await apiClient.get('/loans/overdue');
      return res.data;
    } catch {
      const overdue = PREVIEW_DATA.loans.filter((l) => l.status === 'OVERDUE');
      return { success: true, data: overdue };
    }
  },
  issueBook: async (loanData) => {
    try {
      const res = await apiClient.post('/loans', toFormData(loanData));
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw err;
    }
  },
  returnBook: async (loanId) => {
    try {
      const res = await apiClient.put(`/loans/${loanId}/return`);
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw err;
    }
  },

  getReportsSummary: async () => {
    try {
      const res = await apiClient.get('/reports/summary');
      return res.data;
    } catch {
      return {
        success: true,
        data: {
          totalBooks: 48,
          totalMembers: 24,
          totalTransactions: 6,
          availableBooks: 39,
          issuedBooks: 2,
          returnedBooks: 3,
          overdueBooks: 1,
          totalFinesCollected: 15.0,
        },
      };
    }
  },
  getPopularBooks: async () => {
    try {
      const res = await apiClient.get('/reports/popular-books');
      return res.data;
    } catch {
      return { success: true, data: PREVIEW_DATA.dashboard.popularBooks };
    }
  },
  getCategoryDistribution: async () => {
    try {
      const res = await apiClient.get('/reports/categories');
      return res.data;
    } catch {
      return { success: true, data: PREVIEW_DATA.dashboard.categories };
    }
  },
  getMonthlyBorrowing: async () => {
    try {
      const res = await apiClient.get('/reports/monthly-borrowing');
      return res.data;
    } catch {
      return { success: true, data: PREVIEW_DATA.dashboard.monthlyBorrowing };
    }
  },
};

export default api;
