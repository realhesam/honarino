package service

import (
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

func parseUUID(id string) (pgtype.UUID, error) {
	var uid pgtype.UUID
	if err := uid.Scan(id); err != nil {
		return pgtype.UUID{}, fmt.Errorf("invalid uuid: %w", err)
	}
	return uid, nil
}
