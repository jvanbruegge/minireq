import {
    makeSimpleTests,
    makeHeaderTests,
    makeQueryTests
} from '../../test/index';

import { makeRequest } from '../src/index';

const request = makeRequest();

makeSimpleTests(request);
makeHeaderTests(request);
makeQueryTests(request);
//makeResponseTypeTests(request);
//makeSendTests(request);
//makeSerializationTests(makeRequest);
//makeStreamTests(request);
