/**
 * Carries out deep-comparison of values within two objects.
 * @param {Object} obj1 First object.
 * @param {Object} obj2 Secod object.
 * @param {Number | null} depth Level of nested objects the function should dip into
 * @return returns true
 */
export const objCompare = objcmp;
function objcmp(obj1, obj2, depth = 0) {

    if (!obj1 || !obj2) return false;
    let keys = Object.keys(obj1);

    for (let field of keys) {
        if (obj1[field] != obj2[field]) {
            if (typeof obj1[field] === "object" && typeof obj2[field] === "object" && depth > 1) {
                let recursed = objCompare(obj1[field], obj2[field], depth - 1);
                if (!recursed) return false;
            } else
                return false;
        }
    }
    return true;
}
