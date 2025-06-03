import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getFeedbackRequests } from "../../api/feedbackApi";
import type {  RequestStatus } from "../../types/feedback.types";
import { FeedbackType } from "../../types/feedback.types";
import { formatDistanceToNow } from "date-fns";
import { message } from "antd";
import type { FeedbackRequest as ApiFeedbackRequest, User as ApiUser } from '../../api/feedbackApi';
 
// Ant Design Icons
import {
  PlusOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
 
interface User extends ApiUser {
  firstName?: string;
  lastName?: string;
  position?: string;
}

interface ExtendedFeedbackRequest extends Omit<ApiFeedbackRequest, 'requester' | 'recipient' | 'subject'> {
  requester: User;
  recipient: User;
  subject: User;
}
 
const FeedbackRequests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
 
  const [requests, setRequests] = useState<ExtendedFeedbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
 
  const fetchRequests = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
 
      const data = await getFeedbackRequests(params);
      setRequests(data.items as ExtendedFeedbackRequest[]);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching feedback requests:", error);
      message.error('Failed to load feedback requests');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);
 
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);
 
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };
 
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
 
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "declined":
        return "bg-red-100 text-red-800 border-red-300";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
 
  const getTypeLabel = (type: FeedbackType): string => {
    switch (type) {
      case FeedbackType.PEER:
        return "Peer";
      case FeedbackType.MANAGER:
        return "Manager";
      case FeedbackType.SELF:
        return "Self";
      case FeedbackType.UPWARD:
        return "Upward";
      case FeedbackType.THREE_SIXTY:
        return "360°";
      default:
        return type;
    }
  };
 
  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      console.log(`Request ${requestId} ${accept ? "accepted" : "declined"}`);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Error responding to request:", error);
    }
  };
 

 
  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Feedback Requests
          </h1>
          <p className="text-gray-600">View and manage feedback requests</p>
        </div>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          onClick={() => navigate("/feedback/requests/new")}
        >
          <PlusOutlined className="mr-2" /> New Request
        </button>
      </div>
 
      {/* Table Card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No feedback requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={request.requester?.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full mr-2"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${request.requester?.firstName}&size=32`;
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.requester?.firstName}{" "}
                            {request.requester?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            requested feedback{" "}
                            {formatDistanceToNow(new Date(request.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getTypeLabel(request.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={request.subject?.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full mr-2"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${request.subject?.firstName}&size=32`;
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.subject?.firstName}{" "}
                            {request.subject?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.subject?.position}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(request.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.dueDate) < new Date() &&
                        request.status === "pending"
                          ? "Overdue"
                          : `in ${formatDistanceToNow(
                              new Date(request.dueDate),
                              { addSuffix: true }
                            )}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          title="View Details"
                          onClick={() => navigate(`/feedback/requests/${request.id}`)}
                        >
                          <EyeOutlined className="w-5 h-5" />
                        </button>
 
                        {request.status === "pending" &&
                          request.recipientId === user?.id && (
                            <>
                              <button
                                className="text-green-500 hover:text-green-700"
                                title="Accept Request"
                                onClick={() => handleRespondToRequest(request.id, true)}
                              >
                                <CheckOutlined className="w-5 h-5" />
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700"
                                title="Decline Request"
                                onClick={() => handleRespondToRequest(request.id, false)}
                              >
                                <CloseOutlined className="w-5 h-5" />
                              </button>
                            </>
                          )}
 
                        {request.status === "pending" &&
                          request.requesterId === user?.id && (
                            <>
                              <button
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit"
                                onClick={() =>
                                  navigate(`/feedback/requests/${request.id}/edit`)
                                }
                              >
                                <EditOutlined className="w-5 h-5" />
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700"
                                title="Delete"
                                onClick={() => {}}
                              >
                                <DeleteOutlined className="w-5 h-5" />
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
 
        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div>
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="px-2 py-1 border rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[5, 10, 25].map((option) => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              disabled={page === 0}
              onClick={() => handleChangePage(null, page - 1)}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page + 1} of {Math.ceil(total / rowsPerPage)}
            </span>
            <button
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              disabled={page >= Math.ceil(total / rowsPerPage) - 1}
              onClick={() => handleChangePage(null, page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default FeedbackRequests;