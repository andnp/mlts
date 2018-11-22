import { PlainObject } from 'simplytyped';
import * as _ from 'lodash';

export type Lens = (o: PlainObject) => any;
export const lens = (k: string): Lens => (o: PlainObject) => _.get(o, k);
