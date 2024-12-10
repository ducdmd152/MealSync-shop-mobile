import Withdrawal from "@/app/(pages)/shop/withdrawal";
const MAX_FILE_SIZE_MB = 5;
const CONSTANTS = {
  USER_ROLE: {
    GUEST: 0 as const,
    SHOP_OWNER: 1 as const,
    SHOP_DELIVERY_STAFF: 2 as const,
  },
  REGEX: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{6,9}$/,
    password:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    number: /^\s*-?\d+(\.\d+)?\s*$/,
  },
  FILE_CONSTRAINTS: {
    MAX_FILE_SIZE_MB,
    MAX_FILE_SIZE_BYTE: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  url: {
    avatarDefault:
      "https://thanhtu-blog.s3.ap-southeast-1.amazonaws.com/image/eb7ce841-6579-458a-a46a-1dfc8491ed81-1727165769091.png",
    avatar:
      "https://png.pngtree.com/element_our/20200610/ourmid/pngtree-character-default-avatar-image_2237203.jpg",
    shopLogoDefault: "https://cdn-icons-png.flaticon.com/512/3419/3419665.png",
    addNewImage:
      "https://www.shutterstock.com/image-vector/add-photo-icon-vector-illustration-600nw-1871525389.jpg",
    takeNewImage:
      "data:image/png;base64,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",
    userAvatarDefault:
      "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg",
    shopAvatarSample:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV5-FEuyxb-HMUB41PwAEX_yopAjz0KgMAbg&s",
    noImageAvailable:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Image_not_available.png/640px-Image_not_available.png",
    pink: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTES5ovzC1lSsIL0v3CECqaABnI8jFZevh7Fw&s",
    pickNewImage:
      "https://t4.ftcdn.net/jpg/04/81/13/43/360_F_481134373_0W4kg2yKeBRHNEklk4F9UXtGHdub3tYk.jpg",
    withdrawalRequest:
      "https://icons.veryicon.com/png/o/system/hywf-background-icon/withdraw-9.png",
    balanceBackgroundImage:
      "https://img.freepik.com/free-vector/gradient-blur-pink-blue-abstract-background_53876-117324.jpg",
    balanceDetailBackgroundImage:
      "https://www.shutterstock.com/image-vector/pink-blue-gradient-background-abstract-260nw-2204016497.jpg",
    transaction_circle:
      "https://www.creativefabrica.com/wp-content/uploads/2021/04/05/Money-transaction-icon-Graphics-10421047-1-1-580x386.jpg",
    nofi_icon:
      "https://img.freepik.com/free-vector/blue-notification-bell-with-one-notification_78370-6899.jpg",
  },
};

export default CONSTANTS;
