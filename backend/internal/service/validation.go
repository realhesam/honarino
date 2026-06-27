package service

import (
	"errors"
)

var (
	ErrSamePassword     = errors.New("پسورد جدید نمی‌تواند با پسورد فعلی یکی باشد")
	ErrEmailTaken       = errors.New("ایمیل قبلا ثبت شده است")
	ErrUsernameTaken    = errors.New("نام کاربری قبلا ثبت شده است")
	ErrPhoneTaken       = errors.New("شماره تلفن قبلا ثبت شده است")
	ErrInvalidCreds     = errors.New("نام کاربری یا رمز عبور اشتباه است")
	ErrValidationFailed = errors.New("اعتبارسنجی ناموفق بود")
	ErrUserNotFound     = errors.New("کاربر یافت نشد")
	ErrTokenRevoked     = errors.New("توکن لغو شده است")
)
