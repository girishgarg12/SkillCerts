import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Star, Heart, ShoppingCart } from 'lucide-react';
import { CardContainer, CardBody, CardItem } from '../ui/3DCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDuration } from '../../lib/utils';
import { COURSE_LEVELS } from '../../lib/constants';
import { PaymentModal } from '../payment/PaymentModal';
import { useAuthStore } from '../../store/authStore';
import { Meteors } from '../ui/Meteors';

export const CourseCard = ({ course, onWishlistToggle, isInWishlist }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Quick fix for DevOps course image if backend data is stale
  const displayThumbnail = (course.title && course.title.toLowerCase().includes('devops')) 
    ? '/devops.png' 
    : course.thumbnail;

  const levelColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  };

  const handleBuyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPaymentModal(true);
  };

  return (
    <>
      <CardContainer className="inter-var h-full w-full">
        <CardBody className="bg-black/40 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full min-h-[480px] rounded-xl p-4 border transition-all duration-300 backdrop-blur-sm flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] bg-red-500 rounded-full blur-3xl opacity-0 group-hover/card:opacity-10 pointer-events-none" />
        <Meteors number={10} />
          <div>
            <Link to={`/courses/${course._id || course.id}`}>
              <CardItem
                translateZ="50"
                className="w-full mt-4"
              >
                <img
                  src={displayThumbnail}
                  height="1000"
                  width="1000"
                  className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                  alt={course.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x225?text=Course+Image';
                  }}
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
              </CardItem>
            </Link>
            <div className="mt-4">
              <CardItem
                translateZ="60"
                className="text-xl font-bold text-neutral-200 line-clamp-2 min-h-[56px]"
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
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10 gap-3">
             <CardItem
                translateZ={20}
                className="flex flex-col"
              >
                 <span className="text-xs text-gray-400">Price</span>
                <span className="text-lg font-bold text-white">
                    {course.isFree ? 'Free' : formatCurrency(course.price)}
                </span>
            </CardItem>

            <div className="flex items-center gap-2">
                {onWishlistToggle && (
                    <CardItem
                        translateZ={20}
                        as="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onWishlistToggle(course);
                        }}
                        className={`transition-all p-2.5 rounded-full hover:bg-white/10 border border-white/5 ${isInWishlist ? 'text-pink-500 bg-pink-500/10 border-pink-500/20' : 'text-gray-400 hover:text-pink-500'}`}
                    >
                        <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                    </CardItem>
                )}

                <CardItem translateZ={20}>
                    <Button 
                        size="sm" 
                        onClick={handleBuyClick}
                        className="bg-white text-black hover:bg-gray-200 font-semibold shadow-lg shadow-white/5"
                    >
                        {course.isFree ? 'Enroll' : 'Buy Now'}
                    </Button>
                </CardItem>
            </div>
          </div>
        </CardBody>
      </CardContainer>
      
      <PaymentModal 
        course={course}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        user={user}
      />
    </>
  );
};
