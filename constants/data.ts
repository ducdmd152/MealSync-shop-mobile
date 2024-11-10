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
  },
  FILE_CONSTRAINTS: {
    MAX_FILE_SIZE_MB,
    MAX_FILE_SIZE_BYTE: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  url: {
    avatar:
      "https://png.pngtree.com/element_our/20200610/ourmid/pngtree-character-default-avatar-image_2237203.jpg",
    shopLogoDefault: "https://cdn-icons-png.flaticon.com/512/3419/3419665.png",
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
  },
};

export default CONSTANTS;
