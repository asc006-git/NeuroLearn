import { useState } from "react";
import { FileText, MoreVertical, Folder, File, Clock, Trash2, Download } from "lucide-react";

const documents = [
  { id: 1, name: "Biology Chapter 4.pdf", size: "2.4 MB", date: "Today, 10:30 AM", type: "pdf" },
  { id: 2, name: "Physics Formulas.docx", size: "1.1 MB", date: "Yesterday", type: "doc" },
  { id: 3, name: "History Essay Draft.txt", size: "12 KB", date: "Oct 12", type: "txt" },
  { id: 4, name: "Lecture Notes 05.pdf", size: "4.5 MB", date: "Oct 10", type: "pdf" },
];

export function Documents() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-text-muted">Manage all your uploaded study materials.</p>
        </div>
        <button className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors border border-white/5 flex items-center gap-2">
          <Folder className="w-4 h-4" /> New Folder
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-text-muted text-sm uppercase tracking-wider">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium hidden md:table-cell">Date Uploaded</th>
              <th className="p-4 font-medium hidden sm:table-cell">Size</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-accent-teal">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-white">{doc.name}</span>
                </td>
                <td className="p-4 text-text-muted hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {doc.date}
                  </div>
                </td>
                <td className="p-4 text-text-muted hidden sm:table-cell">{doc.size}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-text-muted hover:text-white transition-colors" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-text-muted hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-text-muted hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
