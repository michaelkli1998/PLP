export type yelpBusinessResponse = {
  id: string;
  alias: string;
  name: string;
  image_url: string;
  is_claimed: boolean;
  is_closed: boolean;
  url: string;
  phone: string;
  display_phone: string;
  review_count: number;
  categories: [
    {
      alias: string;
      title: string;
    }
  ];
  rating: number;
  location: {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: [string];
    cross_streets: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  photos: [string];
  price: string;
  hours: [
    {
      open: [
        {
          is_overnight: boolean;
          start: string;
          end: string;
          day: number;
        }
      ];
      hours_type: string;
      is_open_now: boolean;
    }
  ];
  transactions: [];
  special_hours: [
    {
      date: string;
      is_closed: boolean | null;
      start: string;
      end: string;
      is_overnight: boolean;
    }
  ];
};

export type yelpReviewResponse = {
  total: number;
  possible_languages: string[];
  reviews: [
    {
      id: string;
      text: string;
      url: string;
      rating: number;
      time_created: string;
      user: {
        id: string;
        profile_url: string;
        name: string;
        image_url: string;
      };
    }
  ];
};
