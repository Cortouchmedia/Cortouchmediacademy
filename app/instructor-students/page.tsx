"use client";

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../../components/Icon';

export default function InstructorStudentsPage() {
  const { currentUser, users, courses, handleInstructorMessageSend, instructorMessages } = useAppContext();
  const [messagingStudent, setMessagingStudent] = useState<any>(null);
  const [messageText, setMessageText] = useState('');

  if (!currentUser || currentUser.role !== 'instructor') return null;

  // In a real app, we'd filter users who are enrolled in this instructor's courses
  const instructorCourses = courses.filter(c => c.instructor === currentUser.name);
  const instructorCourseIds = instructorCourses.map(c => c.id);
  
  // Mocking student list for the instructor
  const enrolledStudents = users.filter(u => 
    u.role === 'student' && 
    u.enrolledCourseIds.some(id => instructorCourseIds.includes(id))
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !messagingStudent) return;
    handleInstructorMessageSend(messagingStudent.id, messageText);
    setMessageText('');
  };

  const studentChatHistory = instructorMessages.filter(m => 
    (m.instructorId === currentUser.id && m.studentId === messagingStudent?.id) ||
    (m.instructorId === messagingStudent?.id && m.studentId === currentUser.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Your Students</h1>
        <p className="text-gray-500 mt-1">Track student progress and communicate with them.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Student List</h2>
          <div className="flex gap-4">
            <input type="text" placeholder="Search students..." className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#219BD5]" />
            <button className="px-6 py-2 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7fb0] transition-all">Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Courses</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrolledStudents.length > 0 ? enrolledStudents.map((student, i) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 font-medium">
                      {student.enrolledCourseIds.filter(id => instructorCourseIds.includes(id)).length} Courses
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-100 rounded-full h-2 max-w-[100px]">
                      <div className="bg-[#219BD5] h-2 rounded-full" style={{ width: `${45 + (i * 10)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{45 + (i * 10)}%</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setMessagingStudent(student)}
                      className="text-[#219BD5] font-bold text-sm hover:underline flex items-center gap-1"
                    >
                      <Icon name="messageSquare" className="w-4 h-4" />
                      Chat
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    No students enrolled in your courses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {messagingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <img src={messagingStudent.avatarUrl} alt={messagingStudent.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{messagingStudent.name}</h2>
                  <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setMessagingStudent(null)} className="text-gray-400 hover:text-gray-600 p-2">
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
              {studentChatHistory.length > 0 ? studentChatHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.instructorId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                    msg.instructorId === currentUser.id 
                      ? 'bg-[#219BD5] text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.instructorId === currentUser.id ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Icon name="messageSquare" className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-900">No messages yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Start a conversation with {messagingStudent.name}.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text"
                  required 
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#219BD5] outline-none"
                  placeholder="Type your message..."
                />
                <button 
                  type="submit" 
                  disabled={!messageText.trim()}
                  className="p-3 bg-[#219BD5] text-white font-bold rounded-xl hover:bg-[#1a7fb0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="send" className="w-6 h-6" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
