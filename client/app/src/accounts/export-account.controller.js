;(function () {
  'use strict'

  angular
    .module('sthclient.accounts')
    .controller('ExportAccountController', [
      '$scope',
      '$filter',
      '$mdDialog',
      'accountService',
      'toastService',
      'utilityService',
      'gettextCatalog',
      'gettext',
      'account',
      'theme',
      'STH_LAUNCH_DATE',
      ExportAccountController
    ])

  function ExportAccountController ($scope, $filter, $mdDialog, accountService, toastService, utilityService, gettextCatalog, gettext, account, theme, STH_LAUNCH_DATE) {
    $scope.vm = {}
    $scope.vm.account = account
    $scope.vm.theme = theme
    $scope.vm.numberOfReceivedTransactions = 0
    $scope.vm.hasStarted = false
    $scope.vm.isFinished = false

    $scope.vm.minDate = STH_LAUNCH_DATE

    $scope.vm.startDate = new Date()
    $scope.vm.startDate.setMonth($scope.vm.startDate.getMonth() - 1)
    $scope.vm.endDate = new Date()

    $scope.fileContent = null

    $scope.vm.exportAccount = () => {
      $scope.vm.hasStarted = true

      if ($scope.vm.startDate) {
        $scope.vm.startDate.setHours(0, 0, 0, 0)
      }

      if ($scope.vm.endDate) {
        $scope.vm.endDate.setHours(23, 59, 59, 59)
      }

      accountService.getRangedTransactions($scope.vm.account.address, $scope.vm.startDate, $scope.vm.endDate, onUpdate).then(transactions => {
        prepareFile($scope.vm.account, transactions)
      }).catch(error => {
        if (error.transactions.length) {
          toastService.error(gettextCatalog.getString('An error occured when getting your transactions. However we still got {{ count }} transactions! The exported file contains only these!',
                                                      {count: error.transactions.length}),
          10000)
          prepareFile($scope.vm.account, error.transactions, true)
        } else {
          toastService.error(gettext('An error occured when getting your transactions. Cannot export account!'), 10000)
          $mdDialog.hide()
        }
      })
    }

    $scope.vm.cancel = () => {
      $mdDialog.hide()
    }

    $scope.vm.getStartLabel = () => {
      if ($scope.vm.startDate) {
        return $filter('date')($scope.vm.startDate, 'mediumDate')
      }

      return gettextCatalog.getString('the beginning of time')
    }

    $scope.vm.getEndLabel = () => {
      if ($scope.vm.endDate) {
        return $filter('date')($scope.vm.endDate, 'mediumDate')
      }

      return gettextCatalog.getString('now')
    }

    $scope.vm.downloadFile = () => {
      const blob = new Blob([$scope.fileContent])
      const downloadLink = document.createElement('a')
      downloadLink.setAttribute('download', account.address + '.csv')
      downloadLink.setAttribute('href', window.URL.createObjectURL(blob))
      downloadLink.click()
      $mdDialog.hide()
    }

    function onUpdate (updateObj) {
      $scope.vm.numberOfReceivedTransactions += updateObj.transactions.length
    }

    function prepareFile (account, transactions, isInComplete) {
      $scope.vm.isFinished = true
      const eol = require('os').EOL

      $scope.fileContent = 'Account:,' + account.address + eol +
                           'Balance:,' + utilityService.satoshiToSth(account.balance) + eol +
                           'Transactions' + (isInComplete ? ' (INCOMPLETE):' : ':') + eol +
                           'ID,Confirmations,Date,Type,Amount,From,To,SmartMessage' + eol
      transactions.forEach(trns => {
        $scope.fileContent += trns.id + ',' +
                              trns.confirmations + ',' +
                              new Date(trns.date).toISOString() + ',' +
                              trns.label + ',' +
                              trns.humanTotal + ',' +
                              trns.senderId + ',' +
                              trns.recipientId + ',' +
                              (trns.vendorField ? trns.vendorField : '') + eol
      })
    }
  }
})()
