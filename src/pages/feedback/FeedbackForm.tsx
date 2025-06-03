import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Spin,
  Typography,
  Divider,
  Rate,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  StarOutlined,
  CommentOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import { useAuth } from "../../hooks/useAuth";
import { FeedbackType, FeedbackStatus } from "../../types/feedback.types";
import type { FeedbackRequest } from "../../types/feedback.types";

const { TextArea } = Input;
const { Title } = Typography;

interface FeedbackFormData {
  type: FeedbackType;
  content: string;
  toUserId: string;
  ratings: {
    communication: number;
    teamwork: number;
    technical: number;
    [key: string]: number;
  };
  strengths: string;
  improvements: string;
  status: FeedbackStatus;
  cycleId?: string;
  requestId?: string;
  isAnonymous: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserApiResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  position: string;
  department: string;
  managerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UsersApiResponse {
  items: UserApiResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const ratingCriteria = [
  { id: "communication", label: "Communication" },
  { id: "teamwork", label: "Teamwork" },
  { id: "technical", label: "Technical Skills" },
];

const initialRatings = {
  communication: 0,
  teamwork: 0,
  technical: 0,
};

interface FeedbackFormProps {
  isEdit?: boolean;
  requestId?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  isEdit = false,
  requestId: propRequestId,
}): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const urlRequestId = searchParams.get("requestId");
  const requestId = propRequestId || urlRequestId;
  const { id } = useParams<{ id?: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm<FeedbackFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isFormLoading, setIsFormLoading] = useState(true);

  const initialValues: Omit<FeedbackFormData, "id"> = {
    type: FeedbackType.PEER,
    content: "",
    toUserId: "",
    ratings: { ...initialRatings },
    strengths: "",
    improvements: "",
    isAnonymous: false,
    status: FeedbackStatus.DRAFT,
    cycleId: "",
    requestId: requestId || undefined,
  };

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("token");
    if (!token) {
      enqueueSnackbar("No authentication token found", { variant: "error" });
      return { "Content-Type": "application/json" };
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [enqueueSnackbar]);

  const getApiBaseUrl = useCallback((): string => {
    return import.meta.env.VITE_API_URL || "";
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/users`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch users`);
      }
      const data: UsersApiResponse = await response.json();
      const mappedUsers: User[] = data.items
        .filter((u) => u.id !== user?.id) // Exclude current user
        .map((u) => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          email: u.email,
          avatar: undefined, // API does not provide avatar
        }));
      setUsers(mappedUsers);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch users";
      enqueueSnackbar(`Error fetching users: ${errorMessage}`, {
        variant: "error",
      });
    }
  }, [user, getApiBaseUrl, getAuthHeaders, enqueueSnackbar]);

  const fetchFeedbackRequest = useCallback(
    async (id: string): Promise<FeedbackRequest> => {
      try {
        const response = await fetch(
          `${getApiBaseUrl()}/feedback/requests/${id}`,
          {
            headers: getAuthHeaders(),
          }
        );
        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: Failed to fetch feedback request`
          );
        }
        return await response.json();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch feedback request";
        enqueueSnackbar(`Error: ${errorMessage}`, { variant: "error" });
        throw error;
      }
    },
    [getApiBaseUrl, getAuthHeaders, enqueueSnackbar]
  );

  const updateFeedback = useCallback(
    async (id: string, data: Partial<FeedbackFormData>): Promise<void> => {
      const response = await fetch(`${getApiBaseUrl()}/feedback/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: Failed to update feedback`
        );
      }
    },
    [getApiBaseUrl, getAuthHeaders]
  );

  const createFeedback = useCallback(
    async (data: Omit<FeedbackFormData, "id">): Promise<void> => {
      const response = await fetch(`${getApiBaseUrl()}/feedback`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: Failed to create feedback`
        );
      }
    },
    [getApiBaseUrl, getAuthHeaders]
  );

  const updateRequestStatus = useCallback(
    async (requestId: string, status: string): Promise<void> => {
      const response = await fetch(
        `${getApiBaseUrl()}/feedback/requests/${requestId}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Failed to update request status`
        );
      }
    },
    [getApiBaseUrl, getAuthHeaders]
  );

  const handleSubmit = useCallback(
    async (values: FeedbackFormData) => {
      try {
        setIsSubmitting(true);
        const feedbackData: Omit<FeedbackFormData, "id"> = {
          type: values.type,
          content: values.content,
          toUserId: values.toUserId,
          ratings: {
            communication: values.ratings?.communication || 0,
            teamwork: values.ratings?.teamwork || 0,
            technical: values.ratings?.technical || 0,
          },
          strengths: values.strengths || "",
          improvements: values.improvements || "",
          status: FeedbackStatus.SUBMITTED,
          isAnonymous: values.isAnonymous || false,
          ...(values.cycleId && { cycleId: values.cycleId }),
          ...(values.requestId && { requestId: values.requestId }),
        };

        if (isEdit && id) {
          await updateFeedback(id, feedbackData);
          enqueueSnackbar("Feedback updated successfully", {
            variant: "success",
          });
        } else {
          await createFeedback(feedbackData);
          enqueueSnackbar("Feedback submitted successfully", {
            variant: "success",
          });
          if (values.requestId) {
            try {
              await updateRequestStatus(values.requestId, "expired");
              enqueueSnackbar("Feedback request marked as completed", {
                variant: "success",
              });
            } catch (error) {
              console.error("Failed to update request status:", error);
              enqueueSnackbar(
                "Feedback submitted, but could not update request status",
                { variant: "warning" }
              );
            }
          }
        }
        navigate("/feedback");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        enqueueSnackbar(`Error: ${errorMessage}`, { variant: "error" });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isEdit,
      id,
      updateFeedback,
      createFeedback,
      updateRequestStatus,
      navigate,
      enqueueSnackbar,
    ]
  );

  // Fetch users and feedback request data
  useEffect(() => {
    const initializeForm = async () => {
      setIsFormLoading(true);
      try {
        // Always fetch users from /users
        await fetchUsers();

        // If requestId is provided, fetch feedback request to pre-fill form
        if (requestId) {
          const request = await fetchFeedbackRequest(requestId);
          form.setFieldsValue({
            toUserId: request.recipientId,
            type: request.type,
            cycleId: request.cycleId,
            isAnonymous: request.isAnonymous || false,
            requestId: request.id,
          });
        }

        // If in edit mode, fetch existing feedback
        if (isEdit && id) {
          const feedback = await fetchFeedbackRequest(id);
          form.setFieldsValue({
            ...feedback,
            toUserId: feedback.recipientId,
            status:
              feedback.status === "completed"
                ? FeedbackStatus.SUBMITTED
                : FeedbackStatus.DRAFT,
          });
        }
      } catch {
        // Errors are already handled in fetchUsers and fetchFeedbackRequest
      } finally {
        setIsFormLoading(false);
      }
    };
    initializeForm();
  }, [requestId, isEdit, id, form, fetchUsers, fetchFeedbackRequest]);

  if (isFormLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <Title level={3} className="text-2xl font-bold text-gray-900">
                {isEdit ? "Edit Feedback" : "Provide Feedback"}
              </Title>
              {isFormLoading && <Spin size="small" />}
            </div>
            <p className="mt-3 text-lg text-gray-600">
              Share constructive feedback to help your colleagues grow and
              improve.
            </p>
          </div>

          <Card className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <Spin spinning={isSubmitting}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialValues}
                className="space-y-8"
              >
                {/* General Information Section */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-blue-600 text-xl" />
                    <h4 className="text-xl font-semibold text-gray-900">
                      General Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item
                      name="type"
                      label={
                        <span className="text-gray-700 font-semibold">
                          Feedback Type
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please select feedback type",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select feedback type"
                        className="w-full"
                        disabled={!!requestId}
                      >
                        <Select.Option value={FeedbackType.PEER}>
                          Peer Feedback
                        </Select.Option>
                        <Select.Option value={FeedbackType.MANAGER}>
                          Manager Feedback
                        </Select.Option>
                        <Select.Option value={FeedbackType.UPWARD}>
                          Upward Feedback
                        </Select.Option>
                        <Select.Option value={FeedbackType.THREE_SIXTY}>
                          360° Feedback
                        </Select.Option>
                        <Select.Option value={FeedbackType.SELF}>
                          Self Assessment
                        </Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="toUserId"
                      label={
                        <div className="flex items-center">
                          <span className="text-gray-700 font-semibold">
                            Recipient
                          </span>
                          {requestId && (
                            <span className="ml-2 text-sm text-gray-500">
                              (Pre-selected based on request)
                            </span>
                          )}
                        </div>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please select recipient",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Select recipient"
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                          const user = users.find(
                            (u) => u.id === option?.value
                          );
                          return (
                            user?.name
                              .toLowerCase()
                              .includes(input.toLowerCase()) ||
                            user?.email
                              ?.toLowerCase()
                              .includes(input.toLowerCase()) ||
                            false
                          );
                        }}
                        className="w-full"
                        disabled={isFormLoading}
                        loading={isFormLoading}
                        optionLabelProp="label"
                      >
                        {users.map((user) => (
                          <Select.Option
                            key={user.id}
                            value={user.id}
                            label={user.name}
                          >
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                                <UserOutlined className="text-gray-500" />
                              </div>
                              <span className="mr-2">{user.name}</span>
                              <span className="text-gray-500 text-sm">
                                {user.email}
                              </span>
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <Divider className="my-6" />

                {/* Feedback Content */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <CommentOutlined className="text-blue-600 text-xl" />
                    <h4 className="text-xl font-semibold text-gray-900">
                      Your Feedback
                    </h4>
                  </div>

                  <Form.Item
                    name="content"
                    label={
                      <span className="text-gray-700 font-semibold">
                        Feedback
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter your feedback" },
                    ]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Be specific, constructive, and kind in your feedback..."
                      className="w-full"
                    />
                  </Form.Item>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item
                      name="strengths"
                      label={
                        <span className="text-gray-700 font-semibold">
                          Strengths
                        </span>
                      }
                    >
                      <TextArea
                        rows={3}
                        placeholder="What are they doing well?"
                        className="w-full"
                      />
                    </Form.Item>

                    <Form.Item
                      name="improvements"
                      label={
                        <span className="text-gray-700 font-semibold">
                          Areas for Improvement
                        </span>
                      }
                    >
                      <TextArea
                        rows={3}
                        placeholder="What could they improve?"
                        className="w-full"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Ratings Section */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <StarOutlined className="text-blue-600 text-xl" />
                    <h4 className="text-xl font-semibold text-gray-900">
                      Ratings
                    </h4>
                  </div>

                  <div className="space-y-6">
                    {ratingCriteria.map((criterion) => (
                      <div
                        key={criterion.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-700 font-medium">
                          {criterion.label}
                        </span>
                        <Form.Item name={["ratings", criterion.id]} noStyle>
                          <Rate
                            character={<StarOutlined />}
                            className="text-2xl"
                          />
                        </Form.Item>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <CheckSquareOutlined className="text-blue-600 text-xl" />
                    <h4 className="text-xl font-semibold text-gray-900">
                      Additional Options
                    </h4>
                  </div>

                  <Form.Item
                    name="isAnonymous"
                    valuePropName="checked"
                    className="mb-0"
                  >
                    <Checkbox disabled={!!requestId}>
                      <span className="text-gray-700">Submit anonymously</span>
                    </Checkbox>
                  </Form.Item>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="default"
                    onClick={() => navigate("/feedback")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {isEdit ? "Update Feedback" : "Submit Feedback"}
                  </Button>
                </div>
              </Form>
            </Spin>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
