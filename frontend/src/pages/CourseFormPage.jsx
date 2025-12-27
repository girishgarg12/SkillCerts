
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, BookOpen, Image as ImageIcon, DollarSign } from 'lucide-react';
import { instructorService } from '../services/instructorService';
import { categoryService } from '../services/categoryService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { PageLoader } from '../components/ui/Spinner';

export const CourseFormPage = () => {
    const { id } = useParams(); // If id exists, we're editing
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail: '',
        previewVideo: '',
        price: 0,
        isFree: false,
        level: 'beginner',
        language: 'English',
        category: '',
        thumbnailFile: null,
        previewVideoFile: null,
        totalDuration: 0
    });

    const [thumbnailInputType, setThumbnailInputType] = useState('file'); // 'file' or 'url'
    const [videoInputType, setVideoInputType] = useState('file'); // 'file' or 'url'

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchCourse();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchCourse = async () => {
        try {
            const response = await instructorService.getMyCourses();
            const course = response.data.find(c => c._id === id);

            if (course) {
                setFormData(prev => ({
                    ...prev,
                    title: course.title || '',
                    description: course.description || '',
                    thumbnail: course.thumbnail || '',
                    previewVideo: course.previewVideo || '',
                    price: course.price || 0,
                    isFree: course.isFree || false,
                    level: course.level || 'beginner',
                    language: course.language || 'English',
                    category: course.category?._id || '',
                    thumbnailFile: null,
                    previewVideoFile: null,
                    totalDuration: course.totalDuration || 0
                }));
            }
        } catch (error) {
            setError('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else if (name === 'price') {
            setFormData({ ...formData, [name]: parseFloat(value) || 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Prepare data for API
            const courseData = {
                ...formData,
                price: formData.isFree ? 0 : formData.price,
            };

            // Remove category if it's empty
            if (!courseData.category) {
                delete courseData.category;
            }

            // Check if we need to use FormData (if any files are selected)
            const hasFiles = formData.thumbnailFile || formData.previewVideoFile;
            let submissionData;

            if (hasFiles) {
                const data = new FormData();
                Object.keys(courseData).forEach(key => {
                    // Skip internal fields and nulls
                    if (courseData[key] === null || courseData[key] === undefined) return;

                    if (key === 'thumbnailFile' && courseData[key]) {
                        data.append('thumbnail', courseData[key]);
                    } else if (key === 'previewVideoFile' && courseData[key]) {
                        data.append('previewVideo', courseData[key]);
                    } else if (key !== 'thumbnail' && key !== 'previewVideo' && key !== 'thumbnailFile' && key !== 'previewVideoFile') {
                        // For FormData, all non-file values are converted to strings by the browser
                        data.append(key, courseData[key]);
                    } else if ((key === 'thumbnail' || key === 'previewVideo') && typeof courseData[key] === 'string' && courseData[key].trim() !== '') {
                        // Append as URL string if no file was appended for this field
                        const fileField = key === 'thumbnail' ? 'thumbnailFile' : 'previewVideoFile';
                        if (!courseData[fileField]) {
                            data.append(key, courseData[key]);
                        }
                    }
                });
                submissionData = data;
            } else {
                // In JSON mode, remove File objects and nulls
                const cleanData = {};
                Object.keys(courseData).forEach(key => {
                    if (courseData[key] !== null && courseData[key] !== undefined && !(courseData[key] instanceof File)) {
                        cleanData[key] = courseData[key];
                    }
                });
                submissionData = cleanData;
            }

            if (isEditMode) {
                await instructorService.updateCourse(id, submissionData);
                setSuccess('Course updated successfully!');
                // Don't navigate immediately so user can see success
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const response = await instructorService.createCourse(submissionData);
                setSuccess('Course created successfully!');
                const newCourseId = response.data._id;
                setTimeout(() => navigate(`/instructor/courses/${newCourseId}/edit`), 1500);
            }
        } catch (err) {
            console.error('Course creation/update error details:', err);

            const errorData = err.data || (Array.isArray(err) ? err : null);
            const errorMessage = err.message || (typeof err === 'string' ? err : 'Operation failed');

            if (Array.isArray(errorData)) {
                const validationErrors = errorData.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
                setError(`Validation Failed: ${validationErrors}`);
            } else {
                setError(errorMessage);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div className="bg-[#020617] min-h-screen text-[#f8fafc] pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/instructor/dashboard')}
                        className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <BookOpen className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {isEditMode ? 'Edit Course' : 'Create New Course'}
                            </h1>
                            <p className="text-gray-400">
                                {isEditMode ? 'Update your course details' : 'Fill in the details to create your course'}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert variant="error" className="mb-6" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" className="mb-6">
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <Input
                                    label="Course Title *"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Complete Web Development Bootcamp"
                                    required
                                    className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                                    labelClassName="text-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Describe what students will learn in this course..."
                                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                                        Level *
                                    </label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
                                        required
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="" className="text-gray-500">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id} className="text-black">
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Input
                                    label="Language"
                                    type="text"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    placeholder="e.g., English, Hindi, Spanish"
                                    className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                                    labelClassName="text-gray-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media Card */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">Media</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">
                                    Thumbnail
                                </label>

                                <div className="flex gap-4 mb-4 border-b border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setThumbnailInputType('file')}
                                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${thumbnailInputType === 'file' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
                                    >
                                        Upload File
                                        {thumbnailInputType === 'file' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setThumbnailInputType('url')}
                                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${thumbnailInputType === 'url' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
                                    >
                                        Enter URL
                                        {thumbnailInputType === 'url' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full" />}
                                    </button>
                                </div>

                                {thumbnailInputType === 'file' ? (
                                    <div className="space-y-3">
                                        <Input
                                            type="file"
                                            name="thumbnailFile"
                                            onChange={handleChange}
                                            accept="image/*"
                                            className="bg-black/50 border-white/10 text-white focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Input
                                            type="url"
                                            name="thumbnail"
                                            value={formData.thumbnail}
                                            onChange={handleChange}
                                            placeholder="https://example.com/image.jpg"
                                            className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                                        />
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mt-2 ml-1">
                                    Recommended: 1280x720px (16:9 aspect ratio)
                                </p>
                            </div>

                            {/* Preview Video Section Hidden per user request */}
                            {false && (
                                <div>

                                    <div className="flex gap-4 mb-4 border-b border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setVideoInputType('file')}
                                            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${videoInputType === 'file' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
                                        >
                                            Upload File
                                            {videoInputType === 'file' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVideoInputType('url')}
                                            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${videoInputType === 'url' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
                                        >
                                            Enter URL
                                            {videoInputType === 'url' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full" />}
                                        </button>
                                    </div>

                                    {videoInputType === 'file' ? (
                                        <div className="space-y-3">
                                            <Input
                                                type="file"
                                                name="previewVideoFile"
                                                onChange={handleChange}
                                                accept="video/*"
                                                className="bg-black/50 border-white/10 text-white focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Input
                                                type="url"
                                                name="previewVideo"
                                                value={formData.previewVideo}
                                                onChange={handleChange}
                                                placeholder="https://youtube.com/embed/..."
                                                className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
                                            />
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 mt-2 ml-1">
                                        Add a promotional video for your course
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">Pricing</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                <input
                                    type="checkbox"
                                    id="isFree"
                                    name="isFree"
                                    checked={formData.isFree}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 border-gray-500 rounded focus:ring-blue-500 bg-black/50"
                                />
                                <label htmlFor="isFree" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
                                    This is a free course
                                </label>
                            </div>

                            {!formData.isFree && (
                                <div>
                                    <Input
                                        label="Price (₹) *"
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="999"
                                        min="0"
                                        step="1"
                                        required={!formData.isFree}
                                        className="bg-black/50 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 font-mono text-lg"
                                        labelClassName="text-gray-300"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5 ml-1">
                                        Set the price for your course in Indian Rupees
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/instructor/dashboard')}
                            className="border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} size="lg" className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-bold px-8">
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    {isEditMode ? 'Update Course' : 'Create Course'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {isEditMode && (
                    <div className="mt-8 p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-blue-100 font-semibold">Course Curriculum</h4>
                                <p className="text-blue-200/70 text-sm leading-relaxed mt-1">
                                    Click here to add sections, video lectures, and notes to your course.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate(`/instructor/courses/${id}/edit`)}
                            className="bg-blue-600 hover:bg-blue-500 text-white border-none whitespace-nowrap"
                        >
                            Go to Curriculum
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
