package service

import (
	"errors"
)

var (
	ErrSamePassword               = errors.New("پسورد جدید نمی‌تواند با پسورد فعلی یکی باشد")
	ErrEmailTaken                 = errors.New("ایمیل قبلا ثبت شده است")
	ErrUsernameTaken              = errors.New("نام کاربری قبلا ثبت شده است")
	ErrPhoneTaken                 = errors.New("شماره تلفن قبلا ثبت شده است")
	ErrInvalidCreds               = errors.New("نام کاربری یا رمز عبور اشتباه است")
	ErrValidationFailed           = errors.New("اعتبارسنجی ناموفق بود")
	ErrUserNotFound               = errors.New("کاربر یافت نشد")
	ErrTokenRevoked               = errors.New("توکن لغو شده است")
	ErrVendorRequestNotFound      = errors.New("درخواست یافت نشد")
	ErrVendorRequestAlreadyExists = errors.New("شما قبلا یک درخواست ثبت کردید")
	ErrConflict                   = errors.New("تداخل در داده‌ها")
	ErrProductionNotFound         = errors.New("تولیدی یافت نشد")
	ErrForbidden                  = errors.New("شما اجازه دسترسی به این منبع را ندارید")
	ErrInvalidRole                = errors.New("پرمیشن نامعتبر است")
	ErrMemberAlreadyExists        = errors.New("این کاربر قبلا عضو تولیدی است")
	ErrInvalidMediaType           = errors.New("media type must be logo, banner or cover")
	ErrProductionNotActive        = errors.New("تولیدی هنوز فعال نشده است. لطفا با ادمین تماس بگیرید")
	ErrShopIDTaken                = errors.New("این شناسه فروشگاه قبلاً استفاده شده است")
)
