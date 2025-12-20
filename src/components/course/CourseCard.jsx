import { Link } from 'react-router-dom';
import { Clock, Star, Heart } from 'lucide-react';
import { CardContainer, CardBody, CardItem } from '../ui/3DCard'; // Added import
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDuration } from '../../lib/utils';
import { COURSE_LEVELS } from '../../lib/constants';

export const CourseCard = ({ course, onWishlistToggle, isInWishlist }) => {
  const levelColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  };

  return (
    <CardContainer className="inter-var h-full w-full">
      <CardBody className="bg-black/40 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full min-h-[420px] rounded-xl p-4 border transition-all duration-300 backdrop-blur-sm flex flex-col justify-between">
        <Link to={`/courses/${course._id || course.id}`}>
            <CardItem
            translateZ="50"
            className="w-full mt-2"
            >
                <div className="relative overflow-hidden rounded-xl">
                    <img
                        src={course.thumbnail || 'https://via.placeholder.com/400x225'}
                        alt={course.title}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x225?text=Course+Image';
                        }}
                        className="h-48 w-full object-cover rounded-xl group-hover/card:shadow-xl group-hover/card:scale-105 transition-transform duration-300"
                    />
                    {course.isFree && (
                        <Badge className="absolute top-2 left-2" variant="success">
                            Free
                        </Badge>
                    )}
                    {course.level && (
                        <Badge className="absolute top-2 right-2" variant={levelColors[course.level]}>
                            {COURSE_LEVELS[course.level]}
                        </Badge>
                    )}
                </div>
            </CardItem>
        </Link>
        <div className="mt-4">
            <CardItem
                translateZ="60"
                className="text-xl font-bold text-neutral-200"
            >
                <Link to={`/courses/${course._id || course.id}`} className="hover:text-purple-400 transition-colors">
                    {course.title}
                </Link>
            </CardItem>

            {course.instructor && (
                <CardItem
                    as="p"
                    translateZ="40"
                    className="text-neutral-400 text-sm max-w-sm mt-2 flex items-center gap-2"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                     {course.instructor.name}
                </CardItem>
            )}
            
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                {course.rating > 0 && (
                    <CardItem translateZ={30} className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium text-white">{course.rating.toFixed(1)}</span>
                        {course.ratingCount > 0 && (
                            <span className="text-gray-500">({course.ratingCount})</span>
                        )}
                    </CardItem>
                )}
                {course.totalDuration && (
                    <CardItem translateZ={30} className="flex items-center gap-1">
                         <Clock className="w-4 h-4" />
                        <span>{formatDuration(course.totalDuration)}</span>
                    </CardItem>
                )}
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
                <CardItem
                    translateZ={20}
                    className="px-4 py-2 rounded-xl text-lg font-bold text-white"
                >
                    {course.isFree ? 'Free' : formatCurrency(course.price)}
                </CardItem>

                {onWishlistToggle && (
                    <CardItem
                        translateZ={20}
                        as="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onWishlistToggle(course);
                        }}
                        className={`transition-all p-2 rounded-full hover:bg-white/10 ${isInWishlist ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                    >
                         <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                    </CardItem>
                )}
            </div>
        </div>
      </CardBody>
    </CardContainer>
  );
};
