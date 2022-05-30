const checkLayerConditions = async (encryptInfo,accountId) => {
  for (let condition of encryptInfo.conditions) {
    if (encryptInfo.relationship == "Or") {
      let check = false
      check = await checkCondition(condition,accountId)
      if (check) {
        return true
      }
    } else if (encryptInfo.relationship == "And") {
      let check = false
      check = await checkCondition(condition,accountId)
      if (check) {
        return true
      }
    }
  }

  return false
  /*  if (encryptInfo.relationship == "or") {
      return false
    } else if (encryptInfo.relationship == "and") {
      return true
    }*/
}

const checkCondition = async (condition,accountId) => {
  let token_id = condition['FTCondition'].token_id
  if (token_id != "near") {
    let amount_to_access = condition['FTCondition'].amount_to_access
    let balance = new BN(await checkUserTokenBalance(accountId, token_id))
    if (balance.cmp(new BN(amount_to_access)) == -1) {
      return false
    }
  }
  return true
}

const checkPermission = async (item, accountId) => {
  let have_permission = false
  if (accountId != item.accountId) {
    const encryptInfo = item.access
    have_permission = await checkLayerConditions(encryptInfo,accountId)
  } else if (accountId == item.accountId) {
    have_permission = true
  }
  return have_permission
}

module.exports = {
  checkPermission
}