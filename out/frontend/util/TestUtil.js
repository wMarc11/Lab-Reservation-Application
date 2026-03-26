export var TestUtil;
(function (TestUtil) {
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    TestUtil.sleep = sleep;
})(TestUtil || (TestUtil = {}));
//# sourceMappingURL=TestUtil.js.map