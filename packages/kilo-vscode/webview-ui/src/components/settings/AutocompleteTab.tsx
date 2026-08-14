import { Component } from "solid-js"
import { Switch } from "@kilocode/kilo-ui/switch"
import { Select } from "@kilocode/kilo-ui/select"
import { Card } from "@kilocode/kilo-ui/card"
import { useConfig } from "../../context/config"
import { useLanguage } from "../../context/language"
import SettingsRow from "./SettingsRow"

const FIM_FORMATS = [
  { value: "suffix", labelKey: "settings.autocomplete.fimFormat.suffix" },
  { value: "inline", labelKey: "settings.autocomplete.fimFormat.inline" },
] as const

const AutocompleteTab: Component<{ onNavigateToModels?: () => void }> = (props) => {
  const { settings, updateSetting } = useConfig()
  const language = useLanguage()

  const enabled = (key: string, fallback: boolean) => Boolean(settings()[key] ?? fallback)

  const save = (
    key: "enableAutoTrigger" | "enableSmartInlineTaskKeybinding" | "enableChatAutocomplete",
    value: boolean,
  ) => {
    updateSetting(`autocomplete.${key}`, value)
  }

  const format = () => (settings()["autocomplete.fimFormat"] === "inline" ? "inline" : "suffix")

  return (
    <div data-component="autocomplete-settings">
      <Card>
        <SettingsRow
          title={language.t("settings.autocomplete.autoTrigger.title")}
          description={language.t("settings.autocomplete.autoTrigger.description")}
        >
          <Switch
            checked={enabled("autocomplete.enableAutoTrigger", true)}
            onChange={(checked) => save("enableAutoTrigger", checked)}
            hideLabel
          >
            {language.t("settings.autocomplete.autoTrigger.title")}
          </Switch>
        </SettingsRow>

        <SettingsRow
          title={language.t("settings.autocomplete.smartKeybinding.title")}
          description={language.t("settings.autocomplete.smartKeybinding.description")}
        >
          <Switch
            checked={enabled("autocomplete.enableSmartInlineTaskKeybinding", false)}
            onChange={(checked) => save("enableSmartInlineTaskKeybinding", checked)}
            hideLabel
          >
            {language.t("settings.autocomplete.smartKeybinding.title")}
          </Switch>
        </SettingsRow>

        <SettingsRow
          title={language.t("settings.autocomplete.chatAutocomplete.title")}
          description={language.t("settings.autocomplete.chatAutocomplete.description")}
        >
          <Switch
            checked={enabled("autocomplete.enableChatAutocomplete", false)}
            onChange={(checked) => save("enableChatAutocomplete", checked)}
            hideLabel
          >
            {language.t("settings.autocomplete.chatAutocomplete.title")}
          </Switch>
        </SettingsRow>

        <SettingsRow
          title={language.t("settings.autocomplete.fimFormat.title")}
          description={language.t("settings.autocomplete.fimFormat.description")}
          last
        >
          <Select
            options={[...FIM_FORMATS]}
            current={FIM_FORMATS.find((item) => item.value === format())}
            value={(item) => item.value}
            label={(item) => language.t(item.labelKey)}
            onSelect={(item) => {
              if (!item) return
              updateSetting("autocomplete.fimFormat", item.value)
            }}
            variant="secondary"
            size="small"
            triggerVariant="settings"
          />
        </SettingsRow>
      </Card>
      <p
        data-slot="autocomplete-models-hint"
        style={{
          "margin-top": "20px",
          "font-size": "var(--kilo-font-size-12)",
          "text-align": "right",
          color: "var(--text-weak-base, var(--vscode-descriptionForeground))",
        }}
      >
        <a
          href="#"
          style={{
            color: "var(--vscode-textLink-foreground)",
            "text-decoration": "none",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.preventDefault()
            props.onNavigateToModels?.()
          }}
        >
          {language.t("settings.autocomplete.modelsHint")}
        </a>
      </p>
    </div>
  )
}

export default AutocompleteTab
