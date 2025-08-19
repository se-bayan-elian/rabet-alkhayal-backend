import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class PaginatedDto {
  @ApiProperty()
  count: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}
