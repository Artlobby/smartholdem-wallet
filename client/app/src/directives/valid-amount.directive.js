;(function () {
  'use strict'

  angular.module('sthclient.directives')
    .directive('validAmount', ['utilityService', utilityService => {
      return {
        require: 'ngModel',
        link (scope, elem, attrs, ctrl) {
          const val = value => {
            if (typeof value === 'undefined' || value === 0) {
              ctrl.$pristine = true
            }
            const num = Number(utilityService.sthToSatoshi(value, 0)) // 1.1 = 110000000

            // TODO refactor to avoid the difference between `$scope.x` and `$scope.send.x`

            let totalBalance = scope.send ? scope.send.totalBalance : scope.totalBalance
            totalBalance = Number(utilityService.sthToSatoshi(totalBalance))

            let remainingBalance = utilityService.satoshiToSTH(totalBalance - num, true)
            remainingBalance = isNaN(remainingBalance) ? utilityService.satoshiToSTH(totalBalance, true) : remainingBalance
            if (scope.send) {
              scope.send.remainingBalance = remainingBalance
            } else {
              scope.remainingBalance = remainingBalance
            }

            if (typeof num === 'number' && num > 0) {
              if (num > Number.MAX_SAFE_INTEGER) {
                ctrl.$setValidity('validAmount', false)
              } else {
                ctrl.$setValidity('validAmount', true)
              }
            } else {
              ctrl.$setValidity('validAmount', false)
            }
            return value
          }

          ctrl.$parsers.unshift(val)
          ctrl.$formatters.unshift(val)
        }
      }
    }
    ])
})()