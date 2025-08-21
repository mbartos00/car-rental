import { formatDate, toTitleCase } from "@/lib/utils";
import { Review } from "@/types";
import RatingStars from "./RatingStars";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

type Props = {
  reviewCount?: number;
  reviews: Review[];
};

const CarReviews = ({ reviewCount, reviews }: Props) => {
  return (
    <Card>
      <CardHeader className="flex gap-3 items-center">
        <CardTitle className="text-secondary-500 text-xl lg:text-2xl">
          Reviews
        </CardTitle>
        <div className="bg-primary-500 px-4 py-1 rounded-md shadow-xs text-primary-0 font-bold text-sm">
          {reviewCount}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review, idx) => (
          <section key={review.id}>
            <div className="flex justify-between items-center">
              <p className="font-bold text-secondary-500 text-base">
                {toTitleCase(review.user.firstName)}{" "}
                {toTitleCase(review.user.lastName)}
              </p>
              <div>
                <p className="text-secondary-300 font-medium text-sm">
                  {formatDate(review.createdAt)}
                </p>
                <RatingStars rating={review.rating} />
              </div>
            </div>
            <p className="font-regular text-secondary-400 text-base">
              {toTitleCase(review.description)}
            </p>
            {idx !== reviews.length - 1 && (
              <Separator className="my-2 bg-secondary-300/30" />
            )}
          </section>
        ))}
      </CardContent>
    </Card>
  );
};

export default CarReviews;
