
 const API_URL =
 process.env.NEXT_PUBLIC_API_URL ?? 'https://cortouchmediacademy-production.up.railway.app/api';

if (typeof window !== 'undefined') {
 console.log('[API] Using base URL:', API_URL);
}

// ============================================================
// Error class
// ============================================================

export class ApiError extends Error {
 status: number;
 body: unknown;

 constructor(status: number, message: string, body?: unknown) {
   super(message);
   this.name = 'ApiError';
   this.status = status;
   this.body = body;
 }
}

// ============================================================
// Core fetch wrapper
// ============================================================

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
 body?: unknown;
 token?: string;
}

export async function apiFetch<T = unknown>(
 path: string,
 options: ApiFetchOptions = {},
): Promise<T> {
 const { body, token, headers, ...rest } = options;

 const finalHeaders: Record<string, string> = {
   Accept: 'application/json',
   ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
   ...((headers as Record<string, string>) ?? {}),
 };

 if (token) {
   finalHeaders['Authorization'] = `Bearer ${token}`;
 }

 const url = path.startsWith('http') ? path : `${API_URL}${path}`;

 const res = await fetch(url, {
   ...rest,
   headers: finalHeaders,
   body: body !== undefined ? JSON.stringify(body) : undefined,
 });

 const text = await res.text();
 let parsed: unknown = null;
 try {
   parsed = text ? JSON.parse(text) : null;
 } catch {
   parsed = text;
 }

 if (!res.ok) {
   const message =
     (parsed as any)?.message ??
     (parsed as any)?.error ??
     `Request failed with status ${res.status}`;
   throw new ApiError(res.status, String(message), parsed);
 }

 return parsed as T;
}

// ============================================================
// Convenience methods
// ============================================================

export const api = {
 get: <T = unknown>(path: string, token?: string) =>
   apiFetch<T>(path, { method: 'GET', token }),

 post: <T = unknown>(path: string, body?: unknown, token?: string) =>
   apiFetch<T>(path, { method: 'POST', body, token }),

 put: <T = unknown>(path: string, body?: unknown, token?: string) =>
   apiFetch<T>(path, { method: 'PUT', body, token }),

 patch: <T = unknown>(path: string, body?: unknown, token?: string) =>
   apiFetch<T>(path, { method: 'PATCH', body, token }),

 delete: <T = unknown>(path: string, token?: string) =>
   apiFetch<T>(path, { method: 'DELETE', token }),
};

// ============================================================
// Token helpers
// ============================================================

export const authStorage = {
 getToken(): string | null {
   if (typeof window === 'undefined') return null;
   return window.localStorage.getItem('auth_token');
 },
 setToken(token: string) {
   if (typeof window === 'undefined') return;
   window.localStorage.setItem('auth_token', token);
 },
 clearToken() {
   if (typeof window === 'undefined') return;
   window.localStorage.removeItem('auth_token');
 },
};

// ============================================================
// Typed endpoint helpers
// ============================================================

export interface SignupPayload {
 email: string;
 password: string;
 full_name: string;
 role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'SUPERADMIN';
}

export interface SigninPayload {
 email: string;
 password: string;
}

export interface SigninResponse {
 user: unknown;
 session: { access_token: string; refresh_token?: string };
 message?: string;
}

export interface Course {
 id: string | number;
 title: string;
 description?: string;
 category?: string;
 instructor?: string;
 imageUrl?: string;
 price?: number;
 [key: string]: unknown;
}



// ============================================================
// Multipart upload helper (for file uploads)
// ============================================================

export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData,
  token?: string,
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // IMPORTANT: do NOT set Content-Type. The browser sets it with the
  // correct multipart boundary automatically.
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    const message =
      (parsed as any)?.message ??
      (parsed as any)?.error ??
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, String(message), parsed);
  }

  return parsed as T;
}

export const Api = {
 // Root
 root: () => api.get<{ message: string }>('/'),
 info: () =>
   api.get<{ message: string; endpoints: Record<string, unknown> }>('/info'),
 hello: () => api.get<string>('/hello'),

 // Auth
 auth: {
  signup: (body: SignupPayload) => api.post('/auth/signup', body),
  signin: (body: SigninPayload) =>
    api.post<SigninResponse>('/auth/signin', body),
  signout: (token?: string) => api.post('/auth/signout', {}, token),

  profile: (token: string) =>
    api.get<{
      id: string;
      email: string;
      user_metadata?: Record<string, unknown>;
      profile?: {
        id: string;
        email: string;
        full_name: string | null;
        role: string;
        location?: string | null;
        website?: string | null;
        avatar_url?: string | null;
        about_me?: string | null;
      };
    }>('/auth/profile', token),

  updateUser: (
    id: string,
    body: { full_name?: string; role?: string },
    token: string,
  ) => api.put(`/auth/users?id=${id}`, body, token),
},

 // Courses
 courses: {
   list: () => api.get<Course[]>('/courses'),
   get: (id: string | number) => api.get<Course>(`/courses/${id}`),
   reviews: (id: string | number) => api.get(`/courses/${id}/reviews`),
   create: (body: unknown, token: string) =>
     api.post('/courses', body, token),
   update: (id: string | number, body: unknown, token: string) =>
     api.put(`/courses/${id}`, body, token),
   delete: (id: string | number, token: string) =>
     api.delete(`/courses/${id}`, token),
   enroll: (body: unknown, token: string) =>
     api.post('/courses/enroll', body, token),
     userEnrollments: (userId: string, token?: string) =>
    api.get(`/courses/users/${userId}/enrollments`, token),
    recentEnrollments: (instructorId: string, limit = 5) =>
    api.get(`/courses/instructor/${instructorId}/recent-enrollments?limit=${limit}`),
  instructorStudents: (instructorId: string, token?: string) =>
    api.get<Array<{
      user_id: string;
      user: {
        id: string;
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
      } | null;
      course_count: number;
      completed_count: number;
      avg_progress: number;
      course_ids: string[];
    }>>(`/courses/instructor/${instructorId}/students`, token),
},

assets: {
  upload: (
    file: File,
    opts: {
      entityType: 'user' | 'course' | 'lesson';
      entityId: string;
      type?: string;
      altText?: string;
    },
    token: string,
  ) => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('entity_type', opts.entityType);
    fd.append('entity_id', opts.entityId);
    fd.append('type', opts.type ?? 'avatar');
    if (opts.altText) fd.append('alt_text', opts.altText);

    return apiUpload<{
      success: boolean;
      message: string;
      asset: { id: string; url: string; public_id: string };
      variants: {
        original: string;
        large: string;
        medium: string;
        small: string;
        thumbnail: string;
      };
    }>('/assets/upload', fd, token);
  },
},

 // Users
 users: {
   me: (token: string) => api.get('/auth/profile', token),
   list: (token: string) => api.get('/auth/users', token),
   get: (id: string, token: string) => api.get(`/auth/users/${id}`, token),
 },

 // Payments
 payments: {
   initialize: (body: unknown, token?: string) =>
     api.post('/payments/initialize', body, token),
   verify: (reference: string) =>
     api.get(`/payments/verify?reference=${reference}`),
   userTransactions: (userId: string, token?: string) =>
     api.get(`/payments/user/${userId}/transactions`, token),
 },

  // AI Assistant
  ai: {
    health: () => api.get('/ai/health'),
    ask: (body: { question: string; course_id?: string; user_id?: string }) =>
      api.post<{ success: boolean; question: string; answer: string }>(
        '/ai/ask',
        body,
      ),
    quiz: (body: { course_id?: string; topic: string; difficulty?: string; num_questions?: number }) =>
      api.post('/ai/quiz/generate', body),
    explain: (body: { concept: string; course_id?: string; level?: string }) =>
      api.post('/ai/explain', body),
    summary: (body: { course_id: string }) =>
      api.post('/ai/summary', body),
  },

 // Webinars
 webinars: {
   list: () => api.get('/webinars'),
   upcoming: () => api.get('/webinars/upcoming'),
   live: () => api.get('/webinars/live'),
   get: (id: string) => api.get(`/webinars/${id}`),
   register: (body: { webinar_id: string; user_id: string }, token: string) =>
     api.post('/webinars/register', body, token),
   userRegistrations: (userId: string, token?: string) =>
     api.get(`/webinars/user/${userId}/registrations`, token),
   feedback: (body: { webinar_id: string; user_id: string; rating: number; comment?: string }, token?: string) =>
     api.post('/webinars/feedback', body, token),
 },

// Forum
forum: {
  categories: () => api.get('/forum/categories'),

  topics: (filters?: { category_id?: string; sort?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category_id) params.set('category_id', filters.category_id);
    if (filters?.sort) params.set('sort', filters.sort);
    const qs = params.toString();
    return api.get<{
      topics: Array<{
        id: string;
        title: string;
        content?: string;
        user?: {
          id: string;
          full_name: string | null;
          profile_picture: string | null;
        } | null;
        category?: { name: string; slug: string } | null;
        reply_count?: number;
        view_count?: number;
        like_count?: number;
        created_at: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/forum/topics${qs ? `?${qs}` : ''}`);
  },

  // token is optional: anonymous users get user_has_liked: false
  getTopic: (id: string, token?: string) =>
    api.get<{
      id: string;
      title: string;
      content?: string;
      user?: any;
      category?: any;
      replies: Array<{
        id: string;
        content: string;
        user_id: string;
        user?: {
          id: string;
          full_name: string | null;
          profile_picture: string | null;
        } | null;
        created_at: string;
      }>;
      reply_count: number;
      view_count: number;
      like_count: number;
      user_has_liked?: boolean;
      created_at: string;
    }>(`/forum/topics/${id}`, token),

  createTopic: (
    body: { title: string; content?: string; category_id?: string },
    token: string,
  ) => api.post('/forum/topics', body, token),

  createReply: (
    topicId: string,
    body: { content: string },
    token: string,
  ) => api.post(`/forum/topics/${topicId}/replies`, body, token),

  likeTopic: (topicId: string, token: string) =>
    api.post(`/forum/topics/${topicId}/like`, {}, token),

  bookmarkTopic: (topicId: string, token: string) =>
    api.post(`/forum/topics/${topicId}/bookmark`, {}, token),

  bookmarks: (userId: string, token: string) =>
    api.get(`/forum/users/${userId}/bookmarks`, token),
},

   projects: {
    list: (filters?: {
      course_id?: string;
      instructor_id?: string;
      is_active?: boolean;
    }) => {
      const params = new URLSearchParams();
      if (filters?.course_id) params.set('course_id', filters.course_id);
      if (filters?.instructor_id) params.set('instructor_id', filters.instructor_id);
      if (filters?.is_active !== undefined)
        params.set('is_active', String(filters.is_active));
      const qs = params.toString();
      return api.get(`/projects${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => api.get(`/projects/${id}`),
    create: (
      body: {
        course_id: string;
        instructor_id: string;
        title: string;
        description: string;
        instructions?: string;
        requirements?: any[];
        due_date?: string;
        max_submissions?: number;
        points_possible?: number;
        rubric?: any;
      },
      token: string,
    ) => api.post('/projects', body, token),
    delete: (id: string, instructorId: string, token: string) =>
      api.delete(`/projects/${id}?instructorId=${instructorId}`, token),
    deadline: (projectId: string, studentId: string, token?: string) =>
      api.get<{
        project_id: string;
        student_id: string;
        deadline: string | null;
        source: 'course_completion' | 'instructor_default' | 'none';
        course_completed: boolean;
        course_completed_at: string | null;
      }>(`/projects/deadline/${projectId}/${studentId}`, token),

    submitWithFiles: (
      projectId: string,
      studentId: string,
      description: string,
      screenshots: File[],
      submissionUrl: string | undefined,
      token: string,
    ) => {
      const fd = new FormData();
      fd.append('project_id', projectId);
      fd.append('student_id', studentId);
      fd.append('description', description);
      if (submissionUrl) fd.append('submission_url', submissionUrl);
      screenshots.forEach((file) => fd.append('files', file));
      return apiUpload<{
        success: boolean;
        message: string;
        submission: any;
        isLate: boolean;
      }>('/projects/submit', fd, token);
    },

    projectSubmissions: (
      projectId: string,
      instructorId: string,
      token: string,
    ) =>
      api.get<Array<any>>(
        `/projects/project/${projectId}/submissions?instructorId=${instructorId}`,
        token,
      ),

    aiGrade: (submissionId: string, instructorId: string, token: string) =>
      api.post<{ success: boolean; submission: any }>(
        `/projects/submissions/${submissionId}/ai-grade?instructorId=${instructorId}`,
        {},
        token,
      ),


      instructorSubmissions: (
        instructorId: string,
        options: { status?: 'pending' | 'graded' | 'all'; courseId?: string } = {},
        token?: string,
      ) => {
        const params = new URLSearchParams();
        if (options.status && options.status !== 'all') {
          params.set('status', options.status);
        }
        if (options.courseId) params.set('courseId', options.courseId);
        const qs = params.toString();
        return api.get<{
          submissions: Array<{
            id: string;
            status: string;
            grade: number | null;
            feedback: string | null;
            ai_score: number | null;
            ai_feedback: string | null;
            ai_rubric: any[] | null;
            ai_grade_status: string | null;
            is_late: boolean;
            submitted_at: string;
            description: string | null;
            screenshot_urls: string[] | null;
            submission_url: string | null;
            student: {
              id: string;
              full_name: string | null;
              email: string | null;
              avatar_url: string | null;
            } | null;
            project: { id: string; title: string; course_id: string } | null;
            course: { id: string; title: string } | null;
          }>;
          counts: { pending: number; graded: number; total: number };
        }>(`/projects/instructor/${instructorId}/submissions${qs ? `?${qs}` : ''}`, token);
      },

    approveGrade: (
      submissionId: string,
      body: { grade: number; feedback: string; instructor_id: string },
      token: string,
    ) =>
      api.put<{ success: boolean; submission: any }>(
        `/projects/submissions/${submissionId}/grade`,
        body,
        token,
      ),

    submit: (body: unknown, token: string) =>
      api.post('/projects/submit', body, token),
    studentSubmissions: (studentId: string, token?: string) =>
      api.get(`/projects/student/${studentId}/submissions`, token),
  },
 // Videos
 videos: {
   list: () => api.get('/videos'),
   get: (id: string) => api.get(`/videos/${id}`),
   lessonVideos: (lessonId: string) =>
     api.get(`/videos/lesson/${lessonId}`),
 },

 certificates: {
  mine: (userId: string, token: string) =>
    api.get(`/certificates/my-certificates?userId=${userId}`, token),
  verify: (code: string) => api.get(`/certificates/verify/${code}`),
  get: (id: string) => api.get(`/certificates/${id}`),
},
};

export default api;