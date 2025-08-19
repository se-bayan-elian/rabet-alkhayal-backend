import { Type } from '@nestjs/common';
import { FindOptionsSelect } from 'typeorm';

// Extended Request Methods
export enum ExtendedRequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  LIST = 'LIST',
  DELETE = 'DELETE',
  SOFT_DELETE = 'SOFT_DELETE',
  BULK_CREATE = 'BULK_CREATE',
  RESTORE = 'RESTORE',
}
export interface RouteGuardOptions {
  guards?: (new (...args: any[]) => any)[];
  auth?: boolean;
  roles?: boolean;
  others?: (ClassDecorator | MethodDecorator)[];
}
export interface RouteQueryOptions {
  select?: string[];
  relations?: string[];
}
// Controller Options Interface
export interface ControllerOptions<Entity, CreateDto, UpdateDto> {
  entityName: string;
  entity: Type<Entity>;
  createDtoType: new () => CreateDto;
  updateDtoType: new () => UpdateDto;
  globalGuards?: RouteGuardOptions;
  routeGuards?: {
    create?: RouteGuardOptions;
    findAll?: RouteGuardOptions;
    findOne?: RouteGuardOptions;
    update?: RouteGuardOptions;
    remove?: RouteGuardOptions;
    bulkCreate?: RouteGuardOptions;
    softDelete?: RouteGuardOptions;
    restore?: RouteGuardOptions;
  };

  disallowedMethods?: ExtendedRequestMethod[];
  routeQueryOptions?: {
    findAll?: RouteQueryOptions;
    findOne?: RouteQueryOptions;
  };
}
