"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useParams } from "next/navigation";
import {
  HiEye,
  HiXCircle,
  HiUser,
  HiClock,
  HiShieldCheck,
  HiUserGroup,
  HiCheck,
  HiPlusCircle,
  HiMagnifyingGlass,
  HiXMark,
  HiExclamationTriangle,
  HiPlus,
} from "react-icons/hi2";
import { HiMail, HiPhone } from "react-icons/hi";
import DataList, { DataListColumn } from "@/components/dashboard/Datalist";
import DetailModal from "@/components/dashboard/Detailmodal";
import { InfoRow, InfoBlock } from "@/components/dashboard/Inforow";

import { ProductionService } from "@/lib/modules/production/production.service";

export interface ProductionMemberResponse {
  id: string;
  production_id: string;
  user_id: string;
  role: "owner" | "admin" | "editor";
  created_at: string;
  updated_at: string;
  user?: {
    name?: string;
    username?: string;
    email?: string;
    phone?: string | null;
    profile_picture_url?: string | null;
  };
}

const ITEMS_PER_PAGE = 6;

const ROLE_DETAILS = {
  owner: {
    label: "مالک تولیدی",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  admin: {
    label: "مدیر پرسنل",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  editor: {
    label: "دسترسی ویرایش",
    color: "bg-stone-100 text-stone-700 border-stone-200",
  },
};

export default function ProductionMembersPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const { user } = useUser();

  const [members, setMembers] = useState<ProductionMemberResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<ProductionMemberResponse | null>(null);

  const [memberToDelete, setMemberToDelete] =
    useState<ProductionMemberResponse | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [, setIsUpdatingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"editor" | "admin">(
    "editor",
  );

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ProductionService.getMembers(
        productionId,
        ITEMS_PER_PAGE,
        offset,
      );
      setMembers(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (err: any) {
      console.error("fetch production members failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productionId, offset]);

  useEffect(() => {
    if (productionId) fetchMembers();
  }, [fetchMembers, productionId]);

  const currentUserMember = members.find(
    (member) => member.user_id === user?.id,
  );
  const currentUserRole = currentUserMember?.role ?? null;
  const canAddMembers =
    currentUserRole === "owner" ||
    currentUserRole === "admin" ||
    user?.role === "vendor" ||
    user?.role === "admin";
  const canRemoveMembers =
    currentUserRole === "owner" || user?.role === "admin";
  const canChangeRole = currentUserRole === "owner" || user?.role === "admin";

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsRemoving(true);
    try {
      await ProductionService.removeMember(
        productionId,
        memberToDelete.user_id,
      );
      await fetchMembers();
      if (selectedMember?.user_id === memberToDelete.user_id)
        setSelectedMember(null);
      setMemberToDelete(null);
    } catch (err: any) {
      console.error("remove member failed:", err);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSearchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await ProductionService.searchUsersForMembership(
          productionId,
          query,
        );
        setSearchResults(res.data ?? []);
      } catch (err: any) {
        console.error("search users failed:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [productionId],
  );

  const handleAddMember = async (
    targetUserId: string,
    role: "admin" | "editor",
  ) => {
    setIsAddingMember(true);
    try {
      await ProductionService.addMember(productionId, {
        user_id: targetUserId,
        role,
      });
      setSearchQuery("");
      setSearchResults([]);
      setIsAddModalOpen(false);
      await fetchMembers();
    } catch (err: any) {
      console.error("add member failed:", err);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRoleChange = async (
    memberId: string,
    role: "admin" | "editor",
  ) => {
    setIsUpdatingRole(true);
    try {
      await ProductionService.updateMemberRole(productionId, memberId, {
        role,
      });
      await fetchMembers();
    } catch (err: any) {
      console.error("update member role failed:", err);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const columns: DataListColumn<ProductionMemberResponse>[] = [
    {
      key: "user_info",
      header: "مشخصات همکاران",
      render: (item) => {
        const user = item.user;
        const userName = user?.name || "کاربر";
        const username = user?.username ? `@${user.username}` : "@unknown";

        return (
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 font-bold uppercase overflow-hidden shrink-0">
              {user?.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={userName}
                  className="size-full object-cover"
                />
              ) : (
                userName.charAt(0)
              )}
            </div>
            <div>
              <div className="font-bold text-stone-800 text-sm">{userName}</div>
              <div
                className="text-[10px] text-stone-400 font-mono mt-0.5"
                dir="ltr"
              >
                {username}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "سمت / سطح دسترسی",
      render: (item) => {
        const conf = ROLE_DETAILS[item.role] || ROLE_DETAILS.editor;
        return (
          <span
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${conf.color}`}
          >
            {conf.label}
          </span>
        );
      },
    },
    {
      key: "contact",
      header: "راه‌های ارتباطی",
      render: (item) => {
        const user = item.user;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-stone-600 text-xs" dir="ltr">
              {user?.phone || "---"}
            </span>
            <span className="text-[10px] text-stone-400 font-mono" dir="ltr">
              {user?.email || "---"}
            </span>
          </div>
        );
      },
    },
    {
      key: "joined_at",
      header: "تاریخ عضویت",
      render: (item) => (
        <span className="text-stone-500 text-xs">
          {new Date(item.created_at).toLocaleDateString("fa-IR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "مدیریت دسترسی",
      headerClassName: "text-left",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSelectedMember(item)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition-all active:scale-95 cursor-pointer"
          >
            <HiEye className="size-4 text-stone-500" />
            <span>نمایش کامل</span>
          </button>
          {item.role !== "owner" && (
            <>
              {canChangeRole && (
                <button
                  onClick={() =>
                    handleRoleChange(
                      item.user_id,
                      item.role === "editor" ? "admin" : "editor",
                    )
                  }
                  className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {item.role === "editor"
                    ? "ارتقا به مدیر"
                    : "تنزل به ویرایشگر"}
                </button>
              )}
              {canRemoveMembers && (
                <button
                  onClick={() => setMemberToDelete(item)}
                  className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="لغو دسترسی و حذف"
                >
                  <HiXCircle className="size-4.5" />
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const renderMobileCard = (item: ProductionMemberResponse) => {
    const conf = ROLE_DETAILS[item.role] || ROLE_DETAILS.editor;
    const user = item.user;
    const userName = user?.name || "کاربر";
    const username = user?.username ? `@${user.username}` : "@unknown";

    return (
      <div className="p-4 space-y-3 hover:bg-stone-50/30 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 font-bold overflow-hidden shrink-0">
              {user?.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={userName}
                  className="size-full object-cover"
                />
              ) : (
                <HiUser className="size-4" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-stone-800 text-sm">{userName}</h4>
              <p
                className="text-[10px] text-stone-400 font-mono mt-0.5"
                dir="ltr"
              >
                {username}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${conf.color}`}
          >
            {conf.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-100">
          <div>
            <span className="text-stone-400">تماس:</span>{" "}
            <span className="font-mono text-stone-700">
              {user?.phone || "---"}
            </span>
          </div>
          <div className="text-left">
            <span className="text-stone-400">عضویت:</span>{" "}
            <span className="text-stone-700">
              {new Date(item.created_at).toLocaleDateString("fa-IR")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedMember(item)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all cursor-pointer"
          >
            <HiEye className="size-4 text-stone-500" />
            <span>مشاهده کامل</span>
          </button>
          {item.role !== "owner" && (
            <>
              {canChangeRole && (
                <button
                  onClick={() =>
                    handleRoleChange(
                      item.user_id,
                      item.role === "editor" ? "admin" : "editor",
                    )
                  }
                  className="px-2.5 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-[11px] font-bold"
                >
                  {item.role === "editor" ? "مدیر" : "ویرایشگر"}
                </button>
              )}
              {canRemoveMembers && (
                <button
                  onClick={() => setMemberToDelete(item)}
                  className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <HiXCircle className="size-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col space-y-5 antialiased min-h-0 animate-in fade-in duration-300">
      <div className="border-b border-stone-200/60 pb-4 shrink-0 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-900">
            <HiUserGroup className="size-6 text-primary" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              مدیریت کاربران و دسترسی‌ها
            </h2>
          </div>
          <p className="text-xs font-medium text-stone-500 mt-1.5">
            کنترل، ویرایش و عزل سطوح دسترسی کارکنان، ادمین‌ها و ویراستاران این
            کارگاه تولیدی.
          </p>
        </div>
      </div>

      {canAddMembers && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-5 py-3.5 rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20"
          >
            <HiPlus className="size-4 stroke-[3]" />
            <span>افزودن عضو جدید</span>
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <DataList
          data={members}
          keyExtractor={(item) => item.id}
          columns={columns}
          renderMobileCard={renderMobileCard}
          isLoading={isLoading}
          emptyIcon={<HiUserGroup className="size-5" />}
          emptyTitle="همکاری یافت نشد"
          emptyDescription="هیچ کاربری به عنوان پرسنل برای این تولیدی ثبت نشده است."
          loadingLabel="در حال بارگذاری لیست اعضا..."
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="عضو کارگاه"
        />
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-white shrink-0">
              <div className="flex items-center gap-2 text-stone-800">
                <HiPlusCircle className="size-5 text-emerald-600" />
                <h3 className="font-black text-sm text-stone-800">
                  افزودن عضو جدید به کارگاه
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                type="button"
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <HiXMark className="size-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-stone-700">
                  جستجو و انتساب نقش
                </h4>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  کاربر مورد نظر را پیدا کرده و نقش او را در کارگاه مشخص کنید.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 bg-stone-50 p-1.5 rounded-xl border border-stone-200/60">
                <div className="relative flex-1">
                  <HiMagnifyingGlass className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearchUsers(e.target.value);
                    }}
                    placeholder="نام، یوزرنیم، شماره یا ایمیل..."
                    className="w-full bg-transparent py-2 pr-9 pl-3 text-xs text-stone-800 outline-none placeholder:text-stone-400"
                  />
                </div>

                {currentUserRole === "owner" ||
                  (user?.role == "admin" && (
                    <div className="shrink-0 sm:border-r sm:border-stone-200 sm:pr-2">
                      <select
                        value={selectedRole}
                        onChange={(e) =>
                          setSelectedRole(e.target.value as "editor" | "admin")
                        }
                        className="w-full sm:w-auto bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-stone-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
                      >
                        <option value="editor">دسترسی ویرایش</option>
                        <option value="admin">مدیر پرسنل</option>
                      </select>
                    </div>
                  ))}
              </div>

              {isSearching && (
                <div className="flex items-center justify-center gap-2 py-6 text-xs text-stone-400 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                  <div className="size-3.5 rounded-full border-2 border-stone-200 border-t-emerald-600 animate-spin" />
                  <span>در حال جستجوی کاربران...</span>
                </div>
              )}

              {!isSearching &&
                searchQuery.trim() &&
                searchResults.length === 0 && (
                  <div className="py-8 text-center text-xs text-stone-400 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                    کاربری با این مشخصات یافت نشد.
                  </div>
                )}

              {!isSearching && searchResults.length > 0 && (
                <div className="divide-y divide-stone-100 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                  {searchResults.map((userResult) => {
                    const fallbackChar = (userResult.name || "ک").charAt(0);
                    return (
                      <div
                        key={userResult.id}
                        className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-8 shrink-0 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 font-bold text-xs overflow-hidden">
                            {userResult.profile_picture_url ? (
                              <img
                                src={userResult.profile_picture_url}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              fallbackChar
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-stone-700 truncate group-hover:text-emerald-700 transition-colors">
                              {userResult.name || "کاربر سیستم"}
                            </div>
                            <div
                              className="text-[10px] text-stone-400 font-mono mt-0.5 truncate"
                              dir="ltr"
                            >
                              {userResult.username
                                ? `@${userResult.username}`
                                : userResult.phone || "---"}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleAddMember(
                              userResult.id,
                              currentUserRole === "owner" ||
                                user?.role === "admin"
                                ? selectedRole
                                : "editor",
                            )
                          }
                          disabled={isAddingMember}
                          className="shrink-0 inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white transition disabled:opacity-40 active:scale-95 cursor-pointer shadow-sm shadow-emerald-600/10"
                        >
                          {isAddingMember ? "در حال افزودن..." : "افزودن"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
                >
                  بستن پنجره
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setMemberToDelete(null)}
          />
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-white shrink-0">
              <div className="flex items-center gap-2 text-rose-600">
                <HiExclamationTriangle className="size-5" />
                <h3 className="font-black text-sm text-stone-800">
                  حذف عضو از کارگاه
                </h3>
              </div>
              <button
                onClick={() => setMemberToDelete(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <HiXMark className="size-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-center sm:text-right">
              <p className="text-xs text-stone-600 leading-relaxed">
                آیا از حذف همکار گرامی،{" "}
                <span className="font-black text-stone-900">
                  «{memberToDelete.user?.name || "کاربر منتخب"}»
                </span>{" "}
                از لیست اعضا و ابطال کامل دسترسی‌های وی به این واحد تولیدی مطمئن
                هستید؟
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={handleConfirmDelete}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-40 active:scale-95 cursor-pointer shadow-sm shadow-rose-600/10"
                >
                  {isRemoving ? "در حال حذف..." : "بله، حذف شود"}
                </button>
                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={() => setMemberToDelete(null)}
                  className="flex-1 inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMember && (
        <DetailModal
          icon={<HiShieldCheck className="size-5 text-primary" />}
          title="جزئیات دسترسی و پروفایل همکار"
          onClose={() => setSelectedMember(null)}
          footer={
            <>
              <button
                onClick={() => setSelectedMember(null)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-bold text-xs transition-colors cursor-pointer"
              >
                <HiCheck className="size-4" />
                <span>تایید و بازگشت</span>
              </button>
              {selectedMember.role !== "owner" && canRemoveMembers && (
                <button
                  onClick={() => {
                    setMemberToDelete(selectedMember);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  <HiXCircle className="size-4" />
                  <span>لغو کامل دسترسی</span>
                </button>
              )}
            </>
          }
        >
          <div className="space-y-2 rounded-xl border border-stone-100 bg-white p-3">
            <InfoRow
              icon={<HiUser className="size-3.5" />}
              label="نام و نام خانوادگی"
              value={selectedMember.user?.name || "نام ثبت نشده"}
            />
            <InfoRow
              icon={<HiShieldCheck className="size-3.5" />}
              label="سطح دسترسی فعلی"
              value={
                ROLE_DETAILS[selectedMember.role]?.label || selectedMember.role
              }
            />
            <InfoRow
              icon={<HiPhone className="size-3.5" />}
              label="شماره تماس"
              value={selectedMember.user?.phone || "ثبت نشده"}
              ltr={!!selectedMember.user?.phone}
            />
            <InfoRow
              icon={<HiMail className="size-3.5" />}
              label="پست الکترونیک"
              value={selectedMember.user?.email || "ثبت نشده"}
              ltr
            />
            <InfoRow
              icon={<HiClock className="size-3.5" />}
              label="تاریخ افزودن به کارگاه"
              value={new Date(selectedMember.created_at).toLocaleDateString(
                "fa-IR",
              )}
            />
          </div>

          <InfoBlock
            icon={<HiUser className="size-3.5" />}
            label="نام کاربری سیستم (Username)"
            value={
              selectedMember.user?.username
                ? `@${selectedMember.user.username}`
                : "ثبت نشده"
            }
          />
        </DetailModal>
      )}
    </div>
  );
}
