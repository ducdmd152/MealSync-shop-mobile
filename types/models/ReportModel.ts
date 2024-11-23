export interface ReportGetModel {
  id: number;
  orderId: number;
  title: string;
  content: string;
  imageUrls: string[];
  status: number;
  reason: string | null;
  isReportedByCustomer: boolean;
  createdDate: string; // ISO 8601 date string
  customerInfo: {
    id: number;
    phoneNumber: string;
    email: string;
    avatarUrl: string;
    fullName: string;
  };
}
export interface ReportReplyModel {
  replyReportId: number;
  title: string;
  content: string;
  images: string[];
}
