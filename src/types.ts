import github from "@actions/github"
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods"

export type CommitState =
  RestEndpointMethodTypes["repos"]["createCommitStatus"]["parameters"]["state"]

export type Octokit = ReturnType<typeof github.getOctokit>

export type PR = {
  number: number
  base: {
    repo: {
      name: string
      owner: {
        login: string
      }
    }
  }
  head: {
    sha: string
  }
  user: {
    login: string
  }
  html_url: string
}

export type BaseRule = {
  name: string
  condition:
    | string
    | { include: string }
    | { exclude: string }
    | { include: string; exclude: string }
  check_type: "diff" | "changed_files"
}

export type RuleCriteria = {
  min_approvals: number
  request_review: boolean | true
  users?: Array<string> | null
  teams?: Array<string> | null
}

export type BasicRule = BaseRule & RuleCriteria

export type OrRule = BaseRule & {
  any: RuleCriteria[]
}

export type AndRule = BaseRule & {
  all: RuleCriteria[]
}

export type RuleKind = "BasicRule" | "OrRule" | "AndRule"
export type Rule = BasicRule | OrRule | AndRule

export type RulesConfigurations = {
  basic: {
    kind: "BasicRule"
    uniqueFields: ["min_approvals", "request_review", "teams", "users"]
    invalidFields: ["any", "all"]
  }
  and: {
    kind: "AndRule"
    uniqueFields: ["all"]
    invalidFields: ["min_approvals", "request_review", "teams", "users", "any"]
  }
  or: {
    kind: "OrRule"
    uniqueFields: ["any"]
    invalidFields: ["min_approvals", "request_review", "teams", "users", "all"]
  }
}

export type Configuration = {
  rules: Rule[]
}

export type RuleUserInfo = { teams: Set<string> | null }

export type MatchedRule = {
  name: string
  min_approvals: number
  request_review: boolean
  users: Map<string, RuleUserInfo>
  kind: RuleKind
  id: number
}

export class RuleSuccess {
  constructor(public rule: MatchedRule) {}
}
export class RuleFailure {
  constructor(
    public rule: MatchedRule,
    public problem: string,
    public usersToAskForReview: Map<string, RuleUserInfo>,
  ) {}
}
