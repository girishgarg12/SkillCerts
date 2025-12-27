import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, GripVertical, Save, X, Video, Eye, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { instructorService } from '../../services/instructorService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

export const CurriculumBuilder = ({ courseId }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper function to convert MM:SS or seconds to seconds
  const parseDuration = (duration) => {
    if (!duration) return undefined;

    // If it's already a number, return it
    if (typeof duration === 'number') return duration;

    // If it's a string like "10:30"
    const str = String(duration).trim();
    if (str.includes(':')) {
      const [minutes, seconds] = str.split(':').map(Number);
      return (minutes * 60) + (seconds || 0);
    }

    // If it's just a number as string
    const num = parseInt(str, 10);
    return isNaN(num) ? undefined : num;
  };

  // Section form state
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionTitle, setSectionTitle] = useState('');

  // Lecture form state
  const [addingLectureToSection, setAddingLectureToSection] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    videoUrl: '',
    notesUrl: '',
    videoFile: null,
    notesFile: null,
    duration: '',
    isPreview: false,
  });

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState(new Set());

  useEffect(() => {
    fetchSections();
  }, [courseId]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getCourseSections(courseId);
      setSections(response.data || []);
    } catch (err) {
      toast.error('Failed to load curriculum');
      setError('Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  // Section Handlers
  const handleAddSection = async () => {
    if (!sectionTitle.trim()) {
      toast.error('Please enter a section title');
      return;
    }

    try {
      const response = await instructorService.createSection(courseId, {
        title: sectionTitle,
        order: sections.length + 1,
      });

      const newSection = response.data;
      setSections([...sections, newSection]);
      setSectionTitle('');
      setIsAddingSection(false);

      // Auto-expand the new section so instructor immediately sees "Add Lecture" button
      if (newSection && newSection._id) {
        setExpandedSections(prev => new Set(prev).add(newSection._id));
      }

      toast.success('Section added successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to create section');
      setError(err.message || 'Failed to create section');
    }
  };

  const handleUpdateSection = async (sectionId) => {
    if (!sectionTitle.trim()) {
      toast.error('Please enter a section title');
      return;
    }

    try {
      const response = await instructorService.updateSection(sectionId, {
        title: sectionTitle,
      });
      setSections(sections.map(s => s._id === sectionId ? response.data : s));
      setEditingSectionId(null);
      setSectionTitle('');
      toast.success('Section updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update section');
      setError(err.message || 'Failed to update section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure? This will delete all lectures in this section.')) return;

    try {
      await instructorService.deleteSection(sectionId);
      setSections(sections.filter(s => s._id !== sectionId));
      toast.success('Section deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete section');
      setError(err.message || 'Failed to delete section');
    }
  };

  const startEditSection = (section) => {
    setEditingSectionId(section._id);
    setSectionTitle(section.title);
  };

  const cancelEditSection = () => {
    setEditingSectionId(null);
    setSectionTitle('');
  };

  // Lecture Handlers
  const handleAddLecture = async (sectionId) => {
    if (!lectureForm.title.trim()) {
      toast.error('Please enter a lecture title');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', lectureForm.title);
      data.append('isPreview', lectureForm.isPreview);

      if (lectureForm.videoFile) {
        data.append('video', lectureForm.videoFile);
      } else if (lectureForm.videoUrl) {
        data.append('videoUrl', lectureForm.videoUrl);
      }

      if (lectureForm.notesFile) {
        data.append('notes', lectureForm.notesFile);
      } else if (lectureForm.notesUrl) {
        data.append('notesUrl', lectureForm.notesUrl);
      }

      if (lectureForm.duration) {
        const durationInSeconds = parseDuration(lectureForm.duration);
        if (durationInSeconds !== undefined) {
          data.append('duration', durationInSeconds);
        }
      }

      const response = await instructorService.createLecture(sectionId, data);

      setSections(sections.map(section => {
        if (section._id === sectionId) {
          return {
            ...section,
            lectures: [...(section.lectures || []), response.data]
          };
        }
        return section;
      }));

      resetLectureForm();
      setAddingLectureToSection(null);
      toast.success('Lecture added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create lecture');
      setError(err.message || 'Failed to create lecture');
    }
  };

  const handleUpdateLecture = async () => {
    if (!lectureForm.title.trim() || !editingLecture) {
      toast.error('Please enter a lecture title');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', lectureForm.title);
      data.append('isPreview', lectureForm.isPreview);

      if (lectureForm.videoFile) {
        data.append('video', lectureForm.videoFile);
      } else {
        data.append('videoUrl', lectureForm.videoUrl);
      }

      if (lectureForm.notesFile) {
        data.append('notes', lectureForm.notesFile);
      } else {
        data.append('notesUrl', lectureForm.notesUrl);
      }

      if (lectureForm.duration) {
        const durationInSeconds = parseDuration(lectureForm.duration);
        if (durationInSeconds !== undefined) {
          data.append('duration', durationInSeconds);
        }
      }

      const response = await instructorService.updateLecture(editingLecture._id, data);

      setSections(sections.map(section => ({
        ...section,
        lectures: (section.lectures || []).map(lecture =>
          lecture._id === editingLecture._id ? response.data : lecture
        )
      })));

      resetLectureForm();
      setEditingLecture(null);
      toast.success('Lecture updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update lecture');
      setError(err.message || 'Failed to update lecture');
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;

    try {
      await instructorService.deleteLecture(lectureId);

      setSections(sections.map(section => ({
        ...section,
        lectures: (section.lectures || []).filter(lecture => lecture._id !== lectureId)
      })));

      toast.success('Lecture deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete lecture');
      setError(err.message || 'Failed to delete lecture');
    }
  };

  const startEditLecture = (lecture) => {
    setEditingLecture(lecture);
    setLectureForm({
      title: lecture.title,
      videoUrl: lecture.videoUrl || '',
      notesUrl: lecture.notesUrl || '',
      videoFile: null,
      notesFile: null,
      duration: lecture.duration || '',
      isPreview: lecture.isPreview || false,
    });
  };

  const resetLectureForm = () => {
    setLectureForm({
      title: '',
      videoUrl: '',
      notesUrl: '',
      videoFile: null,
      notesFile: null,
      duration: '',
      isPreview: false,
    });
  };

  const cancelLectureForm = () => {
    resetLectureForm();
    setAddingLectureToSection(null);
    setEditingLecture(null);
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading curriculum...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={section._id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all hover:border-white/20">
            {/* Section Header */}
            <div className="bg-white/5 border-b border-white/10">
              <div className="flex items-center p-4">
                <button
                  onClick={() => toggleSection(section._id)}
                  className="mr-3 text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSections.has(section._id) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1">
                  {editingSectionId === section._id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={sectionTitle}
                        onChange={(e) => setSectionTitle(e.target.value)}
                        placeholder="Section title"
                        className="flex-1 bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 h-9"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleUpdateSection(section._id)} className="bg-blue-600 hover:bg-blue-700 h-9 px-3">
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditSection} className="h-9 px-3 border-white/10 text-gray-300 hover:text-white hover:bg-white/10">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          Section {index + 1}: {section.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {section.lectures?.length || 0} lectures
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditSection(section)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSection(section._id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Content (Lectures) */}
            {expandedSections.has(section._id) && (
              <div className="p-4 bg-black/20">
                {/* Lectures List */}
                {section.lectures && section.lectures.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {section.lectures.map((lecture, lectureIndex) => (
                      <div
                        key={lecture._id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                      >
                        {editingLecture && editingLecture._id === lecture._id ? (
                          <div className="flex-1 space-y-3">
                            <Input
                              value={lectureForm.title}
                              onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                              placeholder="Lecture title"
                              className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs text-gray-400 ml-1">Video Resource</label>
                                <div className="space-y-2">
                                  <Input
                                    value={lectureForm.videoUrl}
                                    onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })}
                                    placeholder="External Video URL"
                                    type="url"
                                    className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                                  />
                                  <div className="relative">
                                    <Input
                                      type="file"
                                      onChange={(e) => setLectureForm({ ...lectureForm, videoFile: e.target.files[0] })}
                                      className="bg-black/50 border-white/10 text-white focus:border-blue-500 h-9 text-xs py-1"
                                      accept="video/*"
                                    />
                                    <div className="absolute right-3 top-2 pointer-events-none">
                                      <Video className="w-4 h-4 text-gray-500" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-gray-400 ml-1">Notes/Resources</label>
                                <div className="space-y-2">
                                  <Input
                                    value={lectureForm.notesUrl}
                                    onChange={(e) => setLectureForm({ ...lectureForm, notesUrl: e.target.value })}
                                    placeholder="Notes URL"
                                    type="url"
                                    className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                                  />
                                  <div className="relative">
                                    <Input
                                      type="file"
                                      onChange={(e) => setLectureForm({ ...lectureForm, notesFile: e.target.files[0] })}
                                      className="bg-black/50 border-white/10 text-white focus:border-blue-500 h-9 text-xs py-1"
                                      accept=".pdf,.doc,.docx,.txt,.zip"
                                    />
                                    <div className="absolute right-3 top-2 pointer-events-none">
                                      <FileText className="w-4 h-4 text-gray-500" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Input
                                value={lectureForm.duration}
                                onChange={(e) => setLectureForm({ ...lectureForm, duration: e.target.value })}
                                placeholder="Duration (e.g., 10:30)"
                                className="w-32 bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                              />
                              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={lectureForm.isPreview}
                                  onChange={(e) => setLectureForm({ ...lectureForm, isPreview: e.target.checked })}
                                  className="w-4 h-4 text-blue-500 bg-black/50 border-gray-500 rounded focus:ring-blue-500"
                                />
                                <span>Free Preview</span>
                              </label>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" onClick={handleUpdateLecture} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelLectureForm} className="border-white/10 text-gray-300 hover:text-white hover:bg-white/10">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                              <div className="p-2 bg-white/5 rounded-lg flex-shrink-0">
                                <Video className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-200 truncate">
                                    {lectureIndex + 1}. {lecture.title}
                                  </span>
                                  {lecture.isPreview && (
                                    <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-blue-400 gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                      <Eye className="w-3 h-3" />
                                      Preview
                                    </span>
                                  )}
                                  {lecture.notesUrl && (
                                    <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-green-400 gap-1 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                                      <FileText className="w-3 h-3" />
                                      Notes
                                    </span>
                                  )}
                                </div>
                                {lecture.duration && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    <span>{lecture.duration}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditLecture(lecture)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteLecture(lecture._id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Lecture Form */}
                {addingLectureToSection === section._id ? (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">New Lecture</h4>
                    <Input
                      value={lectureForm.title}
                      onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                      placeholder="Lecture title"
                      className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Video Resource</label>
                        <div className="space-y-2">
                          <Input
                            value={lectureForm.videoUrl}
                            onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })}
                            placeholder="External Video URL"
                            type="url"
                            className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                          />
                          <div className="relative">
                            <Input
                              type="file"
                              onChange={(e) => setLectureForm({ ...lectureForm, videoFile: e.target.files[0] })}
                              className="bg-black/50 border-white/10 text-white focus:border-blue-500 h-9 text-xs py-1"
                              accept="video/*"
                            />
                            <div className="absolute right-3 top-2 pointer-events-none">
                              <Video className="w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400 ml-1">Notes/Resources</label>
                        <div className="space-y-2">
                          <Input
                            value={lectureForm.notesUrl}
                            onChange={(e) => setLectureForm({ ...lectureForm, notesUrl: e.target.value })}
                            placeholder="Notes URL"
                            type="url"
                            className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                          />
                          <div className="relative">
                            <Input
                              type="file"
                              onChange={(e) => setLectureForm({ ...lectureForm, notesFile: e.target.files[0] })}
                              className="bg-black/50 border-white/10 text-white focus:border-blue-500 h-9 text-xs py-1"
                              accept=".pdf,.doc,.docx,.txt,.zip"
                            />
                            <div className="absolute right-3 top-2 pointer-events-none">
                              <FileText className="w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input
                        value={lectureForm.duration}
                        onChange={(e) => setLectureForm({ ...lectureForm, duration: e.target.value })}
                        placeholder="Duration (e.g., 10:30)"
                        className="w-32 bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={lectureForm.isPreview}
                          onChange={(e) => setLectureForm({ ...lectureForm, isPreview: e.target.checked })}
                          className="w-4 h-4 text-blue-500 bg-black/50 border-gray-500 rounded focus:ring-blue-500"
                        />
                        <span>Free Preview</span>
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => handleAddLecture(section._id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Lecture
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelLectureForm} className="border-white/10 text-gray-300 hover:text-white hover:bg-white/10">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddingLectureToSection(section._id)}
                    className="w-full border border-dashed border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lecture
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Section */}
      {isAddingSection ? (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Input
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Section title"
              className="flex-1 bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
              autoFocus
            />
            <Button onClick={handleAddSection} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button variant="outline" onClick={() => { setIsAddingSection(false); setSectionTitle(''); }} className="border-white/10 text-gray-300 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsAddingSection(true)}
          className="w-full border-dashed border-white/20 text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/30 h-12"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Section
        </Button>
      )}

      {sections.length === 0 && !isAddingSection && (
        <div className="text-center py-16 bg-white/5 rounded-xl border-2 border-dashed border-white/10">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No curriculum yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">Start building your course structure by adding sections and lectures</p>
          <Button onClick={() => setIsAddingSection(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5 mr-2" />
            Add First Section
          </Button>
        </div>
      )}
    </div>
  );
};
