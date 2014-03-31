'use strict';

angular.module('bnePaymentsFrontApp')
  .controller('MainCtrl', function ($scope, $http) {

    $scope.payingAccounts = [];

    $scope.$watch('targetAccount', function() {
      if($scope.targetAccount) {
        if($scope.getPayingAccountIndex($scope.targetAccount.originalObject.id) === -1) {
          $scope.payingAccounts.push($scope.targetAccount.originalObject);
          $scope.paymentConfirmation = true;
        } else {
          console.log("Error, account already added");
        }

      }
    }, true);

    $scope.$watch('thirdAccount', function() {
      if($scope.thirdAccount) {
        if($scope.getPayingAccountIndex($scope.thirdAccount.originalObject.id) === -1) {
          $scope.payingAccounts.push($scope.thirdAccount.originalObject);
          $scope.paymentConfirmation = true;
        } else {
          console.log("Error, account already added");
        }

      }
    }, true);

    $scope.getPayingAccountIndex = function(accountId) {
      for(var i = 0; i < $scope.payingAccounts.length; i++) {
        if($scope.payingAccounts[i].id === accountId) {
          return i;
        }
      }

      return -1;
    };

    $scope.removePayingAccount = function(accountId) {
      var index = $scope.getPayingAccountIndex(accountId);

      if(index != -1) {
        $scope.payingAccounts.splice(index, 1);
      }

      if($scope.payingAccounts.length < 1) {
        $scope.paymentConfirmation = false;
      }
    };

    $scope.processPayment = function() {
      $scope.paymentConfirmation = false;
      $scope.paymentApplied = true;

      $scope.appliedPayments = [];
      $scope.pendingPayments = [];
      $scope.rejectedPayments = [];

      $scope.appliedPayments = $.grep($scope.payingAccounts, function(v) {
        return !v.pending;
      });

      $scope.pendingPayments = $.grep($scope.payingAccounts, function(v) {
        return v.pending;
      });

      $scope.rejectedPayments = $.grep($scope.payingAccounts, function(v) {
        return v.rejected;
      });

    };
  });
