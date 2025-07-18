import { Logger } from '@nestjs/common'

import * as _ from 'lodash'
const moment = require('moment') // require

/**
 * Logger to be used in the helper file
 */
const logger = new Logger('Helpers')

export const getDate = () => logger.log('Hi')

export const formatDate = (dateString) => {
  if (!_.isEmpty(dateString)) {
    const date = new Date(dateString)
    const y = date.getFullYear()
    const m = ('0' + (date.getMonth() + 1)).slice(-2)
    const d = ('0' + date.getDate()).slice(-2)
    return m + '/' + d + '/' + y
  }
  return dateString
}

export const formatDateAndTime = (dateString) => {
  if (!_.isEmpty(dateString)) {
    return moment
      .tz(new Date(dateString), 'America/Toronto')
      .format('MM/DD/YYYY HH:mm')
  }
  return dateString
}

export const formatDateAndTimeWithAmPm = (dateString) => {
  if (!_.isEmpty(dateString)) {
    return moment(new Date(dateString), 'America/Toronto').format(
      'MM/DD/YYYY HH:mm A'
    )
  }
  return dateString
}

export const getTimeZone = () => {
  return 'Asia/Kolkata'
}

export const formatPhoneNumber = function (phoneNumberString) {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return null
}
